# Architekturhypothese: theologischer Denkraum und Schwellenprozess

Diese Datei beschreibt die aktuelle Kernarchitektur. Der primäre Gegenstand ist nicht mehr der Gottesdienstentwurf, sondern der **laufende theologische Denkprozess der Vorbereitenden**.

## 1. Kernmodell

```text
                    Mensch / Vorbereitungsteam
                              │
                              ▼
                  conversational event stream
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           Exegese         Theologie       Außenblick
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                       thinking_state
                              │
                              ▼
                       Threshold Review
                              │
                              ▼
                       worship_artifact
```

Der `thinking_state` hält den aktuellen theologischen Prozess fest:

```yaml
thinking_state:
  theme: ...
  context: ...
  encounters: []
  resonances: []
  irritations: []
  theological_tensions: []
  emerging_testimonies: []
  questions: []
  unresolved: []
```

Ein liturgischer Entwurf ist nicht mehr der Ausgangspunkt, sondern ein späteres Artefakt.

## 2. Context Builder

Jede Perspektive erhält selektiv:

```text
ROLE
+ current thinking_state
+ relevant recent events
+ selected theological research knowledge
+ selected perspective memory
+ permitted local experience context
```

Nicht jede Perspektive benötigt den vollständigen Gesprächsverlauf.

## 3. Perspektiven

Der Denkraum kann je nach Situation unter anderem einladen:

- biblisch-exegetische Perspektive,
- systematisch-theologische Perspektive,
- praktisch-theologische Perspektive,
- liturgische Perspektive,
- ästhetische Perspektive,
- Teilnehmenden- und Außenperspektive,
- interreligiöse oder religionslose Gegenperspektive.

Neu ist die **Threshold Perspective**. Sie prüft den Übergang vom Denkraum zum Gottesdienstraum.

## 4. Threshold Review

Der Übergang zum `worship_artifact` ist ein eigener Vorgang.

```text
thinking_state
     ↓
Was hat sich im Vorbereitungsteam verändert?
     ↓
Was davon ist verantwortbares Zeugnis?
     ↓
Wo wird eigene Erfahrung zur Erwartung an andere?
     ↓
Welche Deutungen und Erfahrungen müssen offen bleiben?
     ↓
worship_artifact
```

Die ausführliche Logik steht in `threshold-to-worship.md`.

## 5. Wissensökologie

Über dem einzelnen Denkprozess liegt die bestehende Knowledge Ecology:

```text
Theological Research Knowledge
Perspective Memory
Local Experience Memory
Practice Pattern Commons
              │
              ▼
       Context Selection
              │
              ▼
       aktueller Denkraum
```

Research Knowledge und geteilte Praxismuster können aus anderen Denkräumen stammen. Lokale Erinnerung bleibt davon getrennt.

## 6. Neue Lernschleife

```text
thinking process
   ↓
threshold
   ↓
worship artifact
   ↓
worship event
   ↓
reception / reflection
   ↓
learning candidates
   ↓
local experience + generalizable patterns
```

Damit kann das System langfristig nicht nur Formen vergleichen, sondern auch die Differenz zwischen eigener Vorbereitungserfahrung, intendierter Gestaltung und tatsächlicher Rezeption reflektieren.

## 7. Architekturregeln

> Der primäre Zustand ist ein Denkprozess, kein Entwurf.

> Der Gottesdienst ist ein neuer Ereignisraum und keine Kopie des Vorbereitungserlebnisses.

> Konsens ist ein mögliches Ergebnis, aber kein Infrastrukturzustand.

> Langzeitwissen wird nach Herkunft, Geltungsbereich und Revidierbarkeit unterschieden.

> Lernen zwischen Denkräumen geschieht über geprüfte Wissensartefakte, nicht über die Öffnung lokaler Erinnerungsbestände.