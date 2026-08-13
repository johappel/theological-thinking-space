# Prototype 02: Denkraum vor Entwurf

## Ziel

Der Prototyp prüft nicht zuerst, ob KI einen guten Gottesdienst schreiben kann. Er prüft, ob ein digitaler Raum einen theologischen Denkprozess der Vorbereitenden vertieft.

## Ablauf

1. Thema, Text oder Situation kommt in den Raum.
2. Das System erzeugt noch keinen Ablauf.
3. Drei Perspektiven arbeiten am selben Denkstand: Bibel/Theologie, Liturgie/Praxis und Außenblick.
4. Festgehalten werden Resonanzen, Irritationen, Spannungen, Fragen und vorläufige Zeugnisse.
5. Erst über einen sichtbaren Schritt **„Zur Schwelle“** beginnt der Übergang zum Gottesdienst.
6. Dort wird geprüft, was als Zeugnis verantwortet werden kann und was für andere offen bleiben soll.
7. Erst danach entsteht ein `worship_artifact`.

## Gemeinsamer Zustand

```yaml
thinking_state:
  theme: ...
  context: ...
  resonances: []
  irritations: []
  theological_tensions: []
  emerging_testimonies: []
  questions: []
  unresolved: []
```

## Minimale UI

```text
┌───────────────────────┬───────────────────────┐
│ DENKTISCH             │ DENKSTAND             │
│ Mensch / Team         │ Resonanzen            │
│ ├─ Bibel/Theologie    │ Irritationen          │
│ ├─ Liturgie/Praxis    │ Spannungen            │
│ └─ Außenblick         │ Zeugnisse / Fragen    │
│                       │ [Zur Schwelle →]       │
└───────────────────────┴───────────────────────┘
```

## Erfolg

Der Prototyp trägt, wenn zuerst eine erkennbare Denkbewegung entsteht und der spätere Gottesdienstentwurf nicht einfach die Erfahrung der Vorbereitenden reproduziert.

> Erst Denkraum, dann Schwelle, dann Gottesdienstraum.