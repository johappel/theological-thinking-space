import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

function requestJson(port, path, body) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: "127.0.0.1",
      port,
      path,
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, (response) => {
      let data = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, data: JSON.parse(data) }));
    });
    request.on("error", reject);
    request.end(JSON.stringify(body));
  });
}

test("/api/think verarbeitet zwei Fragen und begrenzt den Gesprächskontext", async (t) => {
  process.env.PORT = "0";
  process.env.DEEPSEEK_API_KEY = "test-key";
  process.env.MODEL = "test/provider-model";
  process.env.BASE_URL = "http://mock-provider.test/v1";
  const received = [];
  const requestedUrls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, request) => {
    requestedUrls.push(url);
    received.push(JSON.parse(request.body));
    return new Response(JSON.stringify({
      choices: [{
        finish_reason: "stop",
        message: { content: JSON.stringify({
          message: `Mock-Antwort ${received.length}`,
          state_candidates: [],
          suggested_perspective: null,
          threshold_readiness: "not_yet"
        }) }
      }],
      usage: { total_tokens: 42 }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  const { server } = await import("../server.js?test");
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  t.after(async () => {
    globalThis.fetch = originalFetch;
    await new Promise((resolve) => server.close(resolve));
  });

  const body = {
    role: "companion",
    startingPoint: "Wie beginnt der Denkraum?",
    thinkingState: {},
    events: Array.from({ length: 14 }, (_, index) => ({ author: "human", text: `Beitrag ${index}` })),
    currentInput: "Meine zweite Frage"
  };

  for (const expectedMessage of ["Mock-Antwort 1", "Mock-Antwort 2"]) {
    const response = await requestJson(port, "/api/think", body);
    assert.equal(response.status, 200);
    assert.equal(response.data.result.message, expectedMessage);
  }

  assert.equal(received.length, 2);
  assert.deepEqual(requestedUrls, [
    "http://mock-provider.test/v1/chat/completions",
    "http://mock-provider.test/v1/chat/completions"
  ]);
  assert.equal(received[0].max_tokens, 4000);
  assert.equal(received[0].model, "test/provider-model");
  const contextFrom = (request) => JSON.parse(request.messages[1].content.split("\n\n").at(-1));
  assert.equal(contextFrom(received[0]).recent_conversation.length, 12);
  assert.equal(contextFrom(received[1]).recent_conversation.length, 12);
});
