# Architekturhypothese: gemeinsamer theologischer Denkraum

Diese Datei beschreibt noch keine endgültige technische Architektur. Sie formuliert die kleinste Struktur, mit der mehrere KI-Perspektiven tatsächlich **gemeinsam** an einem Gegenstand arbeiten können, ohne lediglich unabhängige Reviews hintereinander zu produzieren.

## 1. Kernmodell

```text
                         ┌─────────────────────┐
                         │       Mensch         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │    conversational stream  │
                    └─────────────┬─────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
       ┌────────────┐       ┌────────────┐       ┌────────────┐
       │ Liturgie   │       │ Theologie  │       │ Außenblick │
       │ perspective│       │ perspective│       │ perspective│
       └──────┬─────┘       └──────┬─────┘       └──────┬─────┘
              │                    │                    │
              └────────────┬───────┴───────────┬────────┘
                           ▼                   ▼
                 ┌─────────────────┐   ┌──────────────────┐
                 │ shared artifact │   │ structured state │
                 └─────────────────┘   └──────────────────┘
```

Jede Perspektive erhält selektiv:

1. den aktuellen gemeinsamen Gegenstand,
2. einen kleinen strukturierten Denkstand,
3. relevante Ereignisse aus dem Gespräch,
4. ihre eigene Rollenbeschreibung und ggf. private Perspektivnotizen.

Sie erhält **nicht automatisch den kompletten Chat und alle privaten Überlegungen anderer Agenten**.

## 2. Shared Artifact

Der gemeinsame Gegenstand ist das, worüber gedacht wird. Beim ersten Prototyp kann das ein sehr einfaches Markdown-/JSON-Objekt sein.

Beispiel:

```yaml
artifact:
  type: worship-experiment
  title: Noch offen
  theme: Einsamkeit
  context:
    place: Stadtkirche
    participants: offen / kirchlich unterschiedlich vertraut
  working_question: >
    Wie kann Einsamkeit wahrgenommen werden, ohne sie vorschnell religiös aufzulösen?
  current_shape: []
  unresolved_tensions:
    - Nähe ermöglichen, ohne Intimität zu erzwingen
    - christliche Hoffnung, ohne Erfahrung zu überreden
```

Wichtig: Der Artifact State ist **kein Chatprotokoll**, sondern der aktuell bearbeitbare Gegenstand.

## 3. Shared Structured Memory

Hier steht nicht alles, was gesagt wurde, sondern nur das, was für die weitere Arbeit als tragender Denkstand markiert wurde.

```yaml
shared_state:
  observations:
    - Einsamkeit ist nicht identisch mit Alleinsein.
  tensions:
    - Trost kann als vorschnelle Auflösung erfahren werden.
  decisions:
    - Noch keinen Ablauf entwerfen.
  questions:
    - Welche nichtsprachlichen Formen können Anwesenheit erfahrbar machen?
  sources: []
```

Der Mensch sollte im Zweifel sehen und beeinflussen können, was hier aufgenommen wird.

## 4. Conversational Event Stream

Der Event Stream macht gemeinsame Arbeit möglich. Er enthält Ereignisse wie:

```json
{"type":"human_message","id":"e17","text":"Mir ist das zu stark auf Trost ausgerichtet."}
{"type":"perspective_observation","id":"e18","agent":"liturgical","text":"Der bisherige Entwurf kennt noch keine Handlung, in der Einsamkeit körperlich oder räumlich vorkommt."}
{"type":"perspective_reply","id":"e19","agent":"theological","replyTo":"e18","text":"Das könnte zugleich verhindern, dass Hoffnung nur als sprachliche Behauptung erscheint."}
{"type":"state_promotion","id":"e20","source":"e19","target":"shared_state.tensions"}
```

Damit kann eine Perspektive auf einen Beitrag einer anderen reagieren. Der Kontext kann jedoch gezielt auf relevante Events begrenzt werden.

## 5. Private Perspective Memory

Eine Perspektive darf eine eigene Kontinuität besitzen, beispielsweise:

```yaml
private_memory:
  agent: liturgical
  recurring_watchpoints:
    - Körper und Raum nicht vergessen
    - Stille nicht automatisch als positiv behandeln
  hypotheses:
    - Der Entwurf könnte mit räumlicher Distanz statt mit Sprache beginnen.
```

Diese Notizen werden nicht automatisch Teil des gemeinsamen Wahrheitsbestands.

## 6. Kontext-Selektion

Eine spätere Implementierung braucht deshalb keinen vollständig geteilten Agenten-Chat. Für jeden Agenten kann ein Context Builder etwa zusammenstellen:

```text
SYSTEM ROLE
+ CURRENT ARTIFACT
+ SHARED STATE
+ latest human event
+ events explicitly addressed to this perspective
+ a small number of semantically relevant recent events
+ private perspective memory
```

Das ist wesentlich einfacher als ein System, in dem alle Agenten jederzeit alles gegenseitig lesen und darauf reagieren.

## 7. Turn-Modell für den ersten Prototyp

Der MVP sollte zunächst **kein autonomes Agenten-Kollektiv** sein. Ein kontrollierter Turn reicht:

1. Mensch äußert einen Gedanken oder verändert den Gegenstand.
2. Companion entscheidet, welche 1–3 Perspektiven dafür relevant sind.
3. Diese Perspektiven erhalten denselben Artifact State und Shared State.
4. Perspektiven geben kurze Beobachtungen oder Fragen ab.
5. Eine Perspektive darf auf einen konkreten Beitrag einer anderen reagieren.
6. Mensch oder Companion entscheidet, was in den Shared State übernommen wird.

Später kann dieser Ablauf dynamischer werden.

## 8. Perspective Refresh als eigener Vorgang

Der Research-/Knowledge-Teil soll nicht permanent alles recherchieren. Ein gezieltes Ereignis löst einen Refresh aus:

```json
{
  "type": "perspective_refresh_requested",
  "reason": "Der Denkraum kreist seit mehreren Turns um Trost und individuelle Innerlichkeit.",
  "search_for": [
    "Ritual Studies",
    "jüdische Klage- und Erinnerungspraxis",
    "säkulare Einsamkeitsforschung"
  ]
}
```

Das Ergebnis sind wenige Perspektivkarten mit Provenienz, Beobachtung und Irritationsfrage – keine Materialhalde.

## 9. Architekturregel

> Konsens ist ein mögliches Ergebnis des Denkens, aber kein Infrastrukturzustand.

Deshalb werden Artifact, Shared State, Event Stream und private Perspektivkontexte getrennt gehalten.
