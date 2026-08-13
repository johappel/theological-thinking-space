# Theological Thinking Space – Prototype 06

Prototype 06 verbindet zwei zentrale Prinzipien:

## Rekursive Suchbewegungen

Die Suchbewegung ist keine einmalige Phase am Anfang. Jeder neue bedeutsame Gedanke kann wieder eine neue Suchbewegung auslösen.

Intern beobachtet der Companion deshalb nur das aktuelle Denksegment:

```yaml
segment:
  state: searching | emerging | stuck | consolidating
  need: open | focus | contrast | resource | stay
  movement: low | medium | high
  new_meaning: true | false
```

Leitregel:

> Je unklarer die Suchbewegung, desto dialogischer und kürzer.
> Je deutlicher ein Gedanke entsteht, desto eher darf der Companion entfalten.
> Je stärker das Gespräch festläuft, desto stärker muss er den Horizont wechseln.

`Und nun?`, `Wie weiter?`, `Ja und?` oder `Was folgt daraus?` können als `need_movement` erkannt werden. Dann darf der Companion nicht einfach mit `stay` weiterfragen.

## Perspektiven bleiben Gesprächspartner

Wenn eine Perspektive an den Tisch geholt wird, bleibt sie im Gespräch.

Beispiel:

```text
COMPANION
Vielleicht wäre Liturgie / Praxis hilfreich.

LITURGIE / PRAXIS
...

DU / TEAM
Aber genau das überzeugt mich nicht.

LITURGIE / PRAXIS
...
```

Nicht automatisch:

```text
DU / TEAM
Aber genau das überzeugt mich nicht.

COMPANION
...
```

Im UI gibt es deshalb unter KI-Beiträgen **Darauf antworten**. Die aktive Perspektive wird oberhalb des Gesprächs angezeigt.

Der Companion bleibt Gastgeber und Prozesswächter, zieht aber nicht automatisch jedes Gespräch wieder an sich.

## Robuster JSON-Parser

Versehntliche Markdown-Codefences um JSON-Antworten werden vor `JSON.parse()` entfernt.

## Start

`.env.example` nach `.env` kopieren und den API-Key setzen:

```bash
npm start
```

Dann:

`http://localhost:8787`

## Testfragen

1. Sind kurze Rückfragen am Anfang hilfreich?
2. Erkennt der Companion, wann Nachfragen nicht mehr weiterführen?
3. Öffnet oder fokussiert er dann tatsächlich?
4. Darf ein entstehender bedeutsamer Gedanke angemessen ausführlicher werden?
5. Fühlt sich ein Austausch mit Liturgie / Bibel / Außenblick wirklich wie ein Gespräch mit dieser Stimme an?
