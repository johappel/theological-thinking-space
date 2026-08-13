# Theological Thinking Space – Prototype 07

Prototype 07 ergänzt den Denkraum um einen **Rand mit Fundstücken**.

## Idee

Nicht jede neue Idee soll aus dem Gespräch selbst entstehen.

Am Rand des Denkraums können beiläufig kleine Fundstücke auftauchen:

- Praxisbeispiele
- Traditionsspuren
- säkulare Fremdperspektiven
- Denkfragmente
- später: echte Artikel, Forschungsbefunde, Kunstwerke und Quellen

Wichtig:

> Ein Fundstück ist keine Empfehlung und keine Lösung.

Es soll zunächst nur sichtbar werden.

## Interaktion

1. Fundstück am Rand entdecken
2. anklicken
3. kurz lesen
4. `An den Tisch holen` oder `Liegen lassen`

Erst wenn es an den Tisch geholt wird, wird es Teil des Gesprächs.

Der Companion soll dann **nicht sofort erklären, was das Fundstück bedeutet**, sondern zuerst fragen,
was daran den User anspricht, irritiert oder neugierig macht.

## Demo-Fundstücke

Prototype 07 enthält zunächst bewusst nur klar markierte Demo-/Kuratiert-Karten:

- Urlauberkirche am See
- Taizé: Gemeinschaft als gelebtes Zeichen
- Third Place statt Veranstaltungsort
- Bewohnter Raum

Sie sind **keine verifizierten Quellenkarten**. Das ist Absicht: Zuerst testen wir die Denkraum-Mechanik.
Erst wenn die funktioniert, bauen wir einen echten Research/Discovery-Worker mit Provenienz und Quellen.

## Warum?

Das Problem der bisherigen Prototypen war:

> Companion und Perspektiven kreisen um das Material, das schon auf dem Tisch liegt.

Der Rand soll Serendipität erzeugen:

> Etwas aus der Welt taucht auf, ohne bereits als Antwort interpretiert zu sein.

## Start

`.env.example` nach `.env` kopieren, API-Key setzen:

```bash
npm start
```

Dann:

`http://localhost:8787`

## Testfrage

Nicht nur:

> Hat das Fundstück thematisch gepasst?

Sondern:

> Hat es meine Suchbewegung verändert?
