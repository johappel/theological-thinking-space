# Architekturhypothese: gemeinsamer und mitwachsender theologischer Denkraum

Diese Datei beschreibt noch keine endgültige technische Architektur. Sie formuliert die kleinste Struktur, mit der mehrere KI-Perspektiven gemeinsam an einem Gegenstand arbeiten können und der Denkraum zugleich über viele Projekte hinweg lernen kann, ohne persönliche Erfahrung, wissenschaftliches Wissen und geteilte Praxismuster zu vermischen.

## 1. Kernmodell des aktuellen Denkraums

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
4. ihre eigene Rollenbeschreibung und ggf. private Perspektivnotizen,
5. gezielt ausgewähltes Langzeitwissen aus der Knowledge Ecology.

Sie erhält **nicht automatisch den kompletten Chat, alle privaten Überlegungen anderer Agenten oder den gesamten Langzeitbestand**.

## 2. Shared Artifact

Der gemeinsame Gegenstand ist das, worüber gedacht wird. Beim ersten Prototyp kann das ein sehr einfaches Markdown-/JSON-Objekt sein.

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

Der Artifact State ist **kein Chatprotokoll**, sondern der aktuell bearbeitbare Gegenstand.

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

Der Mensch sollte sehen und beeinflussen können, was hier aufgenommen wird.

## 4. Conversational Event Stream

Der Event Stream macht gemeinsame Arbeit möglich.

```json
{"type":"human_message","id":"e17","text":"Mir ist das zu stark auf Trost ausgerichtet."}
{"type":"perspective_observation","id":"e18","agent":"liturgical","text":"Der bisherige Entwurf kennt noch keine Handlung, in der Einsamkeit körperlich oder räumlich vorkommt."}
{"type":"perspective_reply","id":"e19","agent":"theological","replyTo":"e18","text":"Das könnte zugleich verhindern, dass Hoffnung nur als sprachliche Behauptung erscheint."}
{"type":"state_promotion","id":"e20","source":"e19","target":"shared_state.tensions"}
```

Damit kann eine Perspektive auf einen Beitrag einer anderen reagieren. Der Kontext kann jedoch gezielt auf relevante Events begrenzt werden.

## 5. Private Perspective Memory

Eine Perspektive darf eine eigene Kontinuität besitzen.

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

Ein Context Builder stellt pro Agent gezielt zusammen:

```text
SYSTEM ROLE
+ CURRENT ARTIFACT
+ SHARED STATE
+ latest human event
+ explicitly addressed events
+ semantically relevant recent events
+ selected theological research knowledge
+ selected practice patterns
+ permitted local experience memory
+ private perspective memory
```

Der Context Builder ist zugleich eine Schutzgrenze: Nicht alles, was im System gespeichert ist, darf automatisch in jeden Agentenkontext gelangen.

## 7. Turn-Modell für den ersten Prototyp

1. Mensch äußert einen Gedanken oder verändert den Gegenstand.
2. Companion entscheidet, welche 1–3 Perspektiven dafür relevant sind.
3. Diese Perspektiven erhalten denselben Artifact State und Shared State.
4. Perspektiven geben kurze Beobachtungen oder Fragen ab.
5. Eine Perspektive darf auf einen konkreten Beitrag einer anderen reagieren.
6. Mensch oder Companion entscheidet, was in den Shared State übernommen wird.

Der MVP bleibt bewusst kontrolliert und wird nicht als autonomes Agentenkollektiv gebaut.

## 8. Perspective Refresh

Ein gezieltes Ereignis kann eine Fremdperspektive anfordern:

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

## 9. Langzeitarchitektur: Knowledge Ecology

Über dem einzelnen Denkraum liegt eine langfristige Wissensökologie:

```text
                 LONG-TERM KNOWLEDGE ECOLOGY

 ┌──────────────────────┐   ┌──────────────────────┐
 │ Theological Research │   │ Perspective Memory   │
 │ Knowledge            │   │                      │
 └──────────┬───────────┘   └──────────┬───────────┘
            │                          │
            ├──────────────┬───────────┤
            │              │           │
            ▼              ▼           ▼
      Context Selection for current Thinking Space
            ▲              ▲
            │              │
 ┌──────────┴───────────┐  │  ┌────────────────────┐
 │ Local Experience     │  │  │ Practice Pattern   │
 │ Memory               │  │  │ Commons            │
 └──────────────────────┘  │  └────────────────────┘
                           │
                    shared with others
```

Vier Wissensarten werden dauerhaft unterschieden:

- **Theological Research Knowledge** – wissenschaftlich und quellengebunden.
- **Local Experience Memory** – persönlich, teambezogen oder lokal; geschützt.
- **Practice Pattern Commons** – generalisierte, geprüfte und freigegebene Praxiserfahrungen.
- **Perspective Memory** – Fragen, Watchpoints, Irritationen und Selbstkorrekturen der Perspektiven.

## 10. Forschungsschleife

```text
current project
   ↓
what do we already know?
   ↓
knowledge gaps
   ↓
Research Worker
   ↓
source work / research
   ↓
Knowledge Candidates
   ↓
provenance + quality + freshness review
   ↓
Theological Research Knowledge
```

Der Research Worker erweitert den Bestand inkrementell. Vorhandenes Wissen wird wiederverwendet, aber auf Aktualität und Geltungsbereich geprüft.

## 11. Erfahrungsschleife

```text
planning / practice / team process
   ↓
reflection
   ↓
Experience Reflection Worker
   ↓
local learning candidates
   ↓
Local Experience Memory
   ↓
later confirmation / contradiction / revision
```

Erfahrungswissen bleibt zunächst lokal. Der Denkraum kann daraus für dieselbe Person oder dasselbe Team lernen, ohne dass diese Erfahrung geteilt werden muss.

## 12. Lernen zwischen Denkräumen

Andere Thinking Spaces dürfen nicht auf fremde Local Experience Memories zugreifen. Austausch erfolgt über kontrollierte Wissensartefakte:

```text
Thinking Space A                      Thinking Space B
local protected memory                local protected memory
        │                                    │
        └──────── Generalization Gate ───────┘
                         │
                         ▼
                  SHARED COMMONS
             ┌──────────────────────┐
             │ research knowledge   │
             │ practice patterns    │
             │ perspective cards    │
             │ methods / sources    │
             └──────────────────────┘
```

**Lernen von anderen bedeutet Austausch geprüfter Wissensartefakte, nicht Zugriff auf fremde Erinnerungen.**

## 13. Sichtbarkeit und Schutzraum

Für lokale Erinnerungen und Wissen gelten gestufte Sichtbarkeiten:

```text
private → team → organization/community → shared commons
```

Eine höhere Sichtbarkeit muss bewusst hergestellt werden. Es gibt keinen automatischen Pfad vom Gespräch zum Shared Commons.

Der Schutzraum ist auch systemisch: Der Denkraum soll Spannungen und unterschiedliche Positionen eines Teams erinnern können, ohne daraus dauerhafte Bewertungen einzelner Personen zu erzeugen.

## 14. Capture Gate und Sharing Gate

Zwei getrennte Übergänge sind notwendig.

### Capture Gate

Entscheidet, ob etwas aus dem aktuellen Gespräch überhaupt dauerhaftes lokales Erfahrungswissen werden soll.

```text
Conversation → candidate → purpose/protection review → Local Experience Memory
```

### Sharing Gate

Entscheidet, ob aus lokalem Erfahrungswissen ein generalisiertes, teilbares Praxismuster werden kann.

```text
Local Experience Memory
   ↓
Generalization
   ↓
Context / privacy / epistemic review
   ↓
Explicit approval
   ↓
Practice Pattern Commons
```

Generalisierung ist mehr als das Entfernen von Namen. Kontext, Unsicherheit und epistemischer Status müssen erhalten bleiben.

## 15. Epistemische Trennung

Wissenschaftliches Wissen und Praxiserfahrung dürfen sich gegenseitig korrigieren, aber nicht vermischt werden.

Der Denkraum soll beispielsweise gleichzeitig sagen können:

> „Die Forschung weist auf eine mögliche Hürde hin.“

und:

> „In unseren bisherigen lokalen Erfahrungen zeigte sich das teilweise anders.“

Die daraus entstehende Spannung ist eine Denkaufgabe und kein Fehler, der durch einen künstlichen Konsens beseitigt werden muss.

## 16. Selbstkorrektur des lernenden Systems

Langzeitwissen erzeugt eigene Defaults. Deshalb müssen Learnings revidierbar bleiben:

```yaml
learning:
  statement: ...
  evidence_for: 7
  evidence_against: 2
  confidence: medium
  status: provisional
  scope: ...
  last_confirmed: ...
```

Der Reviewer soll mit der Zeit nicht nur Modell-Bias, sondern auch **Bias des eigenen Thinking Space** erkennen:

> Welche Denkgewohnheiten haben wir selbst entwickelt?

## 17. Architekturregeln

> Konsens ist ein mögliches Ergebnis des Denkens, aber kein Infrastrukturzustand.

> Lernen bedeutet nicht, alles zu speichern, sondern Wissen nach Herkunft, Geltungsbereich, Schutzbedarf und Revidierbarkeit zu unterscheiden.

> Lernen von anderen bedeutet Austausch geprüfter Wissensartefakte – nicht Öffnung fremder Schutzräume.

> Der Denkraum soll sich erinnern können, ohne Menschen festzuschreiben.
