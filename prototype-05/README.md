# Theological Thinking Space – Prototype 05

Prototype 05 verschiebt den Schwerpunkt von **klugen Antworten** zu **Gesprächssensibilität**.

## Neue Leitregel

> Der Companion trägt pro Turn nur so viel bei, wie nötig ist, damit die Person selbst den nächsten Denkzug machen kann.

## Neu

Der Companion klassifiziert die letzte Äußerung zusätzlich als:

- statement
- question
- hesitation
- uncertainty
- disagreement
- agreement
- invitation
- topic_shift

Bei `hesitation` oder `uncertainty` soll die Antwort gewöhnlich extrem kurz bleiben.

Beispiel:

```text
User: Hmmm
Companion: Ja. Da ist noch etwas offen.
```

oder:

```text
User: Weiß nicht.
Companion: Was daran fühlt sich gerade am wenigsten klar an?
```

Nicht:

```text
User: Hmmm
Companion: Hier sind drei theologische Deutungen ...
```

## Anti-Essay

Standardantwort des Companions:

- 1–3 Sätze
- nur ein Gesprächszug
- keine Listen ohne Nachfrage
- keine automatische Ausarbeitung impliziter Fragen
- nach dem KI-Beitrag gehört der Tisch wieder dem Menschen

## Gesprächsregie

Die Regie aus Prototype 04 bleibt erhalten, ist aber standardmäßig in einem `<details>`-Bereich versteckt.

Sie dient vorerst nur der Beobachtung:

- Welches User-Signal wurde erkannt?
- Welcher Gesprächszug wurde gewählt?
- Gibt es Tunnel-, Konvergenz- oder Verallgemeinerungsrisiko?

## Modell

Standardmäßig `deepseek-v4-flash`.

## Start

`.env.example` nach `.env` kopieren, API-Key setzen und:

```bash
npm start
```

Dann `http://localhost:8787`.

## Test

Nicht primär:

> War die Antwort interessant?

Sondern:

> Wollte ich darauf antworten?

und:

> Hatte ich das Gefühl, selbst zu denken?
