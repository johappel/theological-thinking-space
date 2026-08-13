# Theological Thinking Space – Prototype 03

Erster echter KI-gestützter Thin Slice des neu fokussierten theologischen Denkraums.

## Was dieser Prototyp testet

Nicht: Kann KI einen Gottesdienst erzeugen?

Sondern:

> Entsteht im Gespräch eine erkennbare theologische Denkbewegung, bevor überhaupt ein Gottesdienst entworfen wird?

Der Prototyp besitzt:

- einen **Companion** als Hauptgesprächspartner,
- drei gezielt einladbare Perspektiven:
  - Bibel / Theologie
  - Liturgie / Praxis
  - Außenblick
- einen kleinen `thinking_state`,
- vom Modell vorgeschlagene, aber **vom Menschen zu bestätigende** Einträge in den Denkstand,
- eine bewusste **Schwelle** zwischen Denkraum und späterer Gottesdienstgestaltung,
- lokale Session-Persistenz im Browser.

## Modell und Provider

Der Provider und das Modell werden in `.env` konfiguriert. Die API muss das
OpenAI-kompatible `POST /chat/completions`-Format anbieten. Beispiel für
OpenRouter:

```env
DEEPSEEK_API_KEY=sk-123...
PORT=8787
MODEL=deepseek/deepseek-v4-flash-0731
BASE_URL=https://openrouter.ai/api/v1
```

Standardwerte ohne `.env` sind:

- `deepseek-v4-flash`
- `https://api.deepseek.com`
- Thinking: `enabled`
- Reasoning effort: `high`
- maximale Ausgabe pro Call: `900` Tokens
- JSON Output

Das `reasoning_content` des Modells wird absichtlich weder in der UI angezeigt noch gespeichert.

## Voraussetzungen

- Node.js 20 oder neuer
- API-Key des gewählten Providers

Es sind **keine npm-Abhängigkeiten** erforderlich.

## Start

1. ZIP entpacken.
2. `.env.example` nach `.env` kopieren.
3. API-Key eintragen:

```env
DEEPSEEK_API_KEY=dein_key
PORT=8787
MODEL=deepseek/deepseek-v4-flash-0731
BASE_URL=https://openrouter.ai/api/v1
```

4. Im Projektordner starten:

```bash
npm start
```

5. Browser öffnen:

```text
http://localhost:8787
```

Health Check:

```text
http://localhost:8787/api/health
```

## Architektur

```text
Browser
  |
  | POST /api/think
  v
Node server.js
  |
  | serverseitiger API-Key
  v
konfigurierter Provider und Modell
```

Der Browser erhält niemals den DeepSeek API-Key.

Jeder LLM-Aufruf erhält nur:

- Ausgangspunkt,
- aktuellen strukturierten Denkstand,
- maximal die letzten 12 Gesprächsereignisse,
- aktuelle Eingabe,
- die jeweilige Rollenbeschreibung.

## UX-Prinzip

Der Denkstand wächst nicht automatisch als angebliche Wahrheit.

Das Modell liefert lediglich `state_candidates`. Diese erscheinen rechts als **Vorschläge zum Festhalten**. Erst der Mensch übernimmt oder verwirft sie.

Das soll die Rolle der Vorbereitenden als Kurator:innen des Denkraums erhalten.

## Noch nicht enthalten

- wissenschaftlicher Research Worker
- externe Recherche und Quellen
- Theological Knowledge Commons
- Long-term Experience Memory
- Team-Multiuser
- Practice Pattern Sharing
- Gottesdienst-Generator
- Deployment-Konfiguration für Cloudflare

## Der wichtigste Test

Nach 15–20 Minuten:

1. Hat sich die Ausgangsfrage erkennbar verändert?
2. Hat der Companion wirklich zugehört oder nur passende Theologie produziert?
3. Haben eingeladene Perspektiven einen Unterschied gemacht?
4. Ist der Denkstand hilfreich oder lenkt er vom Gespräch ab?
5. Fühlt sich der Schritt **Zur Schwelle** organisch an?
6. Hilft die Schwelle, die eigene Erfahrung nicht einfach zur erwarteten Erfahrung der späteren Gemeinde zu machen?
