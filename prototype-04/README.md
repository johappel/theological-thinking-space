# Theological Thinking Space ? Prototype 04

Prototype 04 setzt auf dem aktuellen Repo-Stand von `prototype-03` auf.

## Neu: Gespr?chsregie / Anti-Tunnel

Der Companion soll nicht zusammen mit dem Menschen ein immer tieferes Loch graben.

Jeder Modell-Turn liefert zus?tzlich `conversation_dynamics`:

- `dominant_theme`
- `movement`: low / medium / high
- `risk`: none / tunnel / convergence / overgeneralization
- `next_move`
- `note`

M?gliche Gespr?chsz?ge:

- deepen
- differentiate
- contrast
- contextualize
- resource
- condense
- park
- threshold

Bei Tunnel oder Konvergenz darf der Companion nicht einfach weiter vertiefen.

Wenn vom eigenen Erleben auf ?alle?, ?die Gemeinde? oder ?die Menschen? geschlossen wird,
soll der Companion zwischen eigener Erfahrung, Beobachtung und Vermutung unterscheiden.

## UI

Unter dem Gespr?ch erscheint im Prototyp eine kleine Karte ?Gespr?chsbewegung?.
Sie ist vorerst ein Debug- und Experimentierinstrument und kann sp?ter weitgehend unsichtbar werden.

## Start

`.env.example` nach `.env` kopieren, API-Key setzen und:

Optional bei abgeschnittenen Antworten (`finish_reason: length`):

- `MAX_TOKENS=16000` in `.env` setzen

```bash
npm start
```

Dann `http://localhost:8787`.

## Test

Entscheidend ist:

> Erkennt der Companion, wann Vertiefung produktiv ist ? und wann er ?ffnen,
> kontrastieren, verdichten oder eine Spur parken muss?
