# Prototype 01: Drei Perspektiven an einem Tisch

## Ziel

Dieser Prototyp soll **nicht** beweisen, dass ein Multi-Agent-System technisch funktioniert. Er soll eine viel wichtigere Frage beantworten:

> Fühlt es sich anders und produktiver an, wenn mehrere klar unterscheidbare Perspektiven denselben theologischen Gegenstand gemeinsam weiterdenken und aufeinander Bezug nehmen können?

## Minimaler Anwendungsfall

Ein Mensch bringt eine Ausgangsfrage ein:

> „Ich möchte einen experimentellen Gottesdienst zum Thema Einsamkeit entwickeln.“

Das System erzeugt ausdrücklich **noch keinen Ablauf**.

Stattdessen entsteht ein gemeinsamer Arbeitsgegenstand:

```yaml
theme: Einsamkeit
working_question: Wie kann Einsamkeit wahrgenommen werden, ohne sie vorschnell religiös aufzulösen?
current_shape: []
```

Drei Perspektiven sitzen sichtbar „mit am Tisch“:

1. **Liturgische Perspektive** – achtet auf Raum, Körper, Zeit, Ritual und Handlung.
2. **Theologische Perspektive** – achtet auf Gottesbild, implizite Aussagen und vorschnelle Auflösung.
3. **Außenperspektive** – denkt aus Sicht kirchlich distanzierter Teilnehmender und bringt bei Bedarf Fremdperspektiven ein.

## Interaktion

### Turn 1 – Mensch

> „Mir ist wichtig, dass Menschen sich nicht gezwungen fühlen, über ihre Einsamkeit zu sprechen.“

### Turn 2 – Liturgische Perspektive

> „Dann wäre eine frühe Gesprächsrunde wahrscheinlich ein schlechter Default. Können wir Einsamkeit zunächst räumlich oder körperlich erfahrbar machen, ohne Selbstoffenbarung zu verlangen?“

### Turn 3 – Außenperspektive reagiert auf Liturgie

> „Das hilft auch Menschen, die mit religiöser Sprache wenig anfangen können. Aber eine symbolische Handlung darf nicht so codiert sein, dass man erst kirchliches Vorwissen braucht.“

### Turn 4 – Theologische Perspektive reagiert auf beide

> „Wenn wir zunächst Wahrnehmung ermöglichen, statt Trost auszusprechen, verändert das auch die Gottesrede. Gott wäre nicht zuerst die schnelle Antwort auf Einsamkeit. Ist diese Offenheit gewollt?“

Jetzt hat das System keine drei separaten Reviews produziert. Die Beiträge bilden eine **kleine Argumentationsbewegung**.

## Was der Mensch tun können soll

Bei jedem Beitrag:

- **Vertiefen** – diese Spur mit derselben Perspektive weiterdenken.
- **An den Tisch geben** – eine andere Perspektive gezielt darauf reagieren lassen.
- **Festhalten** – als Beobachtung, Spannung, Entscheidung oder Frage in den gemeinsamen Denkstand übernehmen.
- **Parken** – relevant, aber derzeit nicht weiterverfolgen.
- **Verwerfen** – nicht in den Denkraum übernehmen.

Der Mensch bleibt damit Kurator:in des Denkraums.

## UI-Papierskizze

```text
┌─────────────────────────────────────────────────────────────────────┐
│ THEOLOGICAL THINKING SPACE                         [Perspective +]   │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │ Gemeinsamer Denkstand                │
│       DENKTISCH              │                                      │
│                              │ Spannungen                           │
│  Mensch                      │ • Trost nicht vorschnell anbieten    │
│    │                         │ • Nähe ohne Selbstoffenbarungszwang  │
│    ├── Liturgie              │                                      │
│    │    „Was geschieht       │ Offene Fragen                        │
│    │     eigentlich im Raum?“│ • Wie wird Anwesenheit erfahrbar?   │
│    │                         │                                      │
│    ├── Außenblick            │ [Perspective Refresh]               │
│    │    ↳ reagiert darauf    │                                      │
│    │                         │                                      │
│    └── Theologie             │                                      │
│         ↳ reagiert auf beide │                                      │
│                              │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│ Deine nächste Intervention …                              [Senden]  │
└─────────────────────────────────────────────────────────────────────┘
```

Wichtig ist nicht die konkrete Aufteilung. Sichtbar werden müssen aber:

- der gemeinsame Gegenstand,
- die unterscheidbaren Stimmen,
- Bezugnahmen zwischen ihnen,
- der kleine gemeinsame Denkstand,
- die Steuerungsmöglichkeit des Menschen.

## Kein Agenten-Zoo

Der erste Prototyp sollte bewusst nur drei Perspektiven verwenden. Weitere Linsen können später dynamisch eingeladen werden. Zu viele Rollen würden das Gespräch sofort wieder in eine Review-Liste verwandeln.

## Perspective Refresh im Prototyp

Ein Button oder Companion-Vorschlag kann den aktuellen Denkraum diagnostizieren:

> „Wir denken seit mehreren Beiträgen hauptsächlich individualpsychologisch. Soll eine Fremdperspektive hereinkommen?“

Ein Refresh liefert höchstens drei Karten:

```text
RITUAL STUDIES
Beobachtung: Rituale organisieren Beziehungen und Positionen im Raum, nicht nur Bedeutungen.
Frage: Wie könnte räumliche Distanz selbst Teil des Gottesdienstes werden?

JÜDISCHE KLAGEPRAXIS
Beobachtung: Klage muss nicht unmittelbar in Trost oder Auflösung überführt werden.
Frage: Welche Form dürfte offen enden?

SOZIALE EINSAMKEITSFORSCHUNG
Beobachtung: Einsamkeit ist nicht nur ein individuelles Gefühl, sondern kann strukturelle Ursachen haben.
Frage: Wo individualisiert unser bisheriger Entwurf das Problem?
```

Im echten System müssen solche Karten Quellen und Provenienz mitführen.

## Technisch kleinster Prototyp

Für eine erste lauffähige Version reichen:

- ein Web-Frontend mit Gespräch und Shared-State-Seitenleiste,
- ein `artifact.json`,
- ein `shared-state.json`,
- ein append-only `events.jsonl`,
- drei Agenten-Konfigurationen,
- ein Context Builder, der pro Perspektive nur relevante Ausschnitte zusammenstellt,
- ein einfacher Orchestrator für gezielte Turns.

Noch **nicht** erforderlich:

- autonome Agentenschleifen,
- Vektordatenbank,
- langfristiges semantisches Gedächtnis,
- komplexes Agentenframework,
- automatische Konsensbildung,
- umfassender theologischer RAG-Bestand.

## Erfolgskriterien

Der Prototyp ist interessant, wenn nach 15–20 Minuten Nutzung mindestens Folgendes spürbar wird:

1. Die Perspektiven klingen nicht nur unterschiedlich, sondern **verändern gegenseitig ihre Fragen**.
2. Der Mensch kann nachvollziehen, was gemeinsamer Denkstand und was nur eine Perspektive ist.
3. Ein Entwurf entsteht langsamer, aber weniger klischeehaft.
4. Das Gespräch bleibt wichtiger als die Agentenmechanik.
5. Der Mensch hat das Gefühl, mit einem kleinen Denkraum zu arbeiten – nicht drei Chatbots gleichzeitig zu bedienen.

## Nächster Entwicklungsschritt

Wenn dieser Paper Prototype überzeugt, sollte als nächstes **genau dieser eine Gesprächsablauf** als klickbarer/lauffähiger Thin Slice implementiert werden. Erst danach lohnt die Entscheidung, ob Buzzich oder ein anderes Agenten-Harness als technische Basis tatsächlich vereinfacht oder unnötige Komplexität einführt.
