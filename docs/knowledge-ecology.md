# Knowledge Ecology: ein mitwachsender theologischer Denkraum

## 1. Grundidee

Der Theological Thinking Space soll nicht nur einzelne Gespräche erinnern. Er soll über viele Projekte hinweg **lernen**, ohne persönliche Erfahrung, wissenschaftliches Wissen und lokale Praxis zu vermischen.

Selbstlernend bedeutet hier ausdrücklich **nicht**, dass sich ein Sprachmodell autonom nachtrainiert. Lernen entsteht durch eine transparente, revidierbare Wissensarchitektur um das Modell herum.

Der Denkraum entwickelt mit der Zeit eine eigene Erfahrungsgeschichte, einen wachsenden theologischen Forschungsbestand, ein Repertoire an Perspektiven und – nur nach kontrollierter Generalisierung – gemeinsam nutzbare Praxismuster.

## 2. Vier getrennte Wissensräume

### A. Theological Research Knowledge

Quellengebundenes, wissenschaftlich erschlossenes Wissen, z. B.:

- biblische Textarbeit und Exegese,
- systematisch-theologische Positionen,
- praktisch-theologische Forschung,
- Liturgiewissenschaft,
- Ritual Studies,
- empirische Religionsforschung,
- interreligiöse Perspektiven,
- kirchliche Agenden, Ordnungen und Handreichungen,
- relevante außertheologische Forschung.

Dieses Wissen ist grundsätzlich portabel und zwischen Denkräumen teilbar, sofern Provenienz, Geltungsbereich und epistemischer Status erhalten bleiben.

### B. Local Experience Memory

Erfahrungswissen aus realen Denk- und Praxisprozessen, z. B.:

- persönliche Präferenzen und Lernbewegungen,
- Erfahrungen eines Vorbereitungsteams,
- lokale Gemeindegeschichte,
- Beobachtungen aus realisierten Gottesdiensten,
- Entscheidungen, Irritationen und spätere Revisionen.

Dieses Wissen ist standardmäßig **privat oder teambezogen**. Es ist nicht automatisch Teil eines gemeinsamen Wissensbestands.

### C. Practice Pattern Commons

Aus lokalen Erfahrungen können generalisierte Praxismuster entstehen. Sie dürfen erst dann geteilt werden, wenn sie:

- von personenbezogenen und lokal identifizierbaren Details getrennt wurden,
- nicht nur anonymisiert, sondern wirklich generalisiert wurden,
- ihren Kontext und ihre Unsicherheit behalten,
- nicht als wissenschaftliche Evidenz ausgegeben werden,
- geprüft und ausdrücklich freigegeben wurden.

Beispiel:

```yaml
practice_pattern:
  statement: >
    Offene Gesprächsangebote können bei existenziellen Themen
    eine hohe Schwelle persönlicher Selbstoffenbarung erzeugen.
  epistemic_status:
    type: generalized_practice_experience
  contexts:
    - open_worship
    - existential_topics
  evidence:
    projects: 6
    teams: 4
  uncertainty: medium
  personal_data: none
  sharing_status: approved
```

### D. Perspective Memory

Perspektiven selbst können lernen. Gespeichert werden z. B.:

- wiederkehrende Watchpoints,
- produktive Fragen,
- typische eigene Verengungen,
- Selbstkorrekturen,
- Perspektiven, die in bestimmten Kontexten fehlen.

Beispiel:

```yaml
perspective_memory:
  perspective: liturgical
  recurring_watchpoints:
    - embodiment
    - space
    - voluntariness
  self_corrections:
    - >
      Partizipation nicht automatisch als Qualitätsmerkmal behandeln;
      Nichtteilnahme kann eine legitime rituelle Position sein.
```

## 3. Zwei zentrale Lernschleifen

### Forschungsschleife

```text
Projektfrage
   ↓
Bestandsprüfung
   ↓
Wissenslücken
   ↓
Research Worker
   ↓
Quellenerschließung
   ↓
Knowledge Candidates
   ↓
Qualitäts- und Provenienzprüfung
   ↓
Theological Research Knowledge
   ↓
selektiver Rückfluss in spätere Projekte
```

Mit jedem Projekt wird der gemeinsame wissenschaftlich-theologische Bestand gezielt erweitert. Der Worker recherchiert nicht bei jeder Anfrage alles neu, sondern prüft vorhandenes Wissen auf Relevanz, Lücken und Aktualität.

### Erfahrungsschleife

```text
Planung
   ↓
Praxis / Gottesdienst / Teamprozess
   ↓
Beobachtung und Feedback
   ↓
Reflection Worker
   ↓
Learning Candidates
   ↓
Local Experience Memory
   ↓
spätere Bestätigung / Widerspruch / Revision
```

Erfahrung wird zunächst lokal erinnert. Erst ein zusätzlicher Generalisierungs- und Freigabeprozess kann daraus ein übertragbares Practice Pattern machen.

## 4. Wissenschaftliches Wissen als Korrekturinstanz

Theological Research Knowledge soll nicht nur Material liefern, sondern Denkbewegungen korrigieren können.

Beispiel:

> „Im Gleichnis vom verlorenen Sohn geht es darum, dass Gott jeden Menschen bedingungslos annimmt.“

Ein exegetischer Research Layer könnte zurückmelden:

- Diese Deutung ist möglich, aber nicht die einzige.
- Der unmittelbare Erzählrahmen betrifft Jesu Tischgemeinschaft mit Zöllnern und Sündern.
- Die offene Reaktion des älteren Sohnes ist für die Dramaturgie relevant.

Der Research Layer produziert keine letztgültige Interpretation. Er verhindert vielmehr, dass plausible Modellformulierungen unbemerkt zum theologischen Fundament werden.

## 5. Unterschiedliche epistemische Stati bleiben sichtbar

Der Denkraum darf wissenschaftliche Forschung und eigene Erfahrung aufeinander beziehen, aber nicht vermischen.

Beispiel:

```text
Forschung:
Offene Gesprächsformen können hohe Anforderungen an
sprachliche Selbstoffenbarung stellen.

Eigene Erfahrung:
In mehreren lokalen Jugendgottesdiensten wurden
moderierte Kleingruppengespräche positiv angenommen.
```

Die richtige Reaktion lautet nicht „die Forschung stimmt nicht“ oder „unsere Erfahrung zählt nicht“, sondern:

> Welche Kontextbedingungen erklären die Spannung?

## 6. Wissensobjekte brauchen Provenienz und Aktualität

Ein Knowledge Item sollte mindestens beschreiben:

```yaml
knowledge_item:
  domain: biblical-studies
  claim: ...
  source:
    author: ...
    title: ...
    year: ...
    locator: ...
  epistemic_status:
    type: exegetical_interpretation
    consensus: medium
  scope: ...
  alternatives: []
  freshness:
    stability: slow-changing
    last_verified: 2026-08-13
  used_in: []
```

Kirchliche Agenden und Ordnungen benötigen zusätzlich Geltungsbereich und Versionslogik:

```yaml
knowledge_item:
  domain: church-order
  jurisdiction:
    church: ...
  document:
    title: ...
    edition: ...
    valid_from: ...
  epistemic_status:
    type: normative_church_document
  freshness:
    stability: versioned
    last_verified: ...
    recheck_required: true
```

Der Denkraum muss erkennen können, welche Informationen historisch stabil, langsam veränderlich oder regelmäßig neu zu prüfen sind.

## 7. Unterschiedliche Skills für unterschiedliche Wissenspflege

### Research / Knowledge Worker

Benötigte Fähigkeiten:

- Literatur- und Quellenrecherche,
- Quellenkritik,
- theologische Domänenerschließung,
- Vergleich unterschiedlicher Positionen,
- Provenienzpflege,
- Versions- und Aktualitätsprüfung,
- Erkennen von Forschungslücken.

Ziel: **belastbares theologisches Wissen erweitern.**

### Experience Reflection Worker

Benötigte Fähigkeiten:

- Reflexionsgespräche auswerten,
- Beobachtung von Interpretation unterscheiden,
- Kontextbedingungen bewahren,
- Ambivalenzen nicht vorschnell auflösen,
- wiederkehrende Erfahrungen erkennen,
- personenbezogene Inhalte schützen.

Ziel: **aus Erfahrung lernen, ohne sie vorschnell zu verallgemeinern.**

### Generalization / Sharing Worker

Benötigte Fähigkeiten:

- lokale Erfahrung abstrahieren,
- Identifizierbarkeit vermeiden,
- Kontextbedingungen erhalten,
- Übertragbarkeit und Unsicherheit markieren,
- epistemischen Status bewahren,
- Freigabestatus prüfen.

Ziel: **nur solche Erfahrungsgewinne teilen, die als generalisierte Praxismuster wirklich verantwortbar sind.**

## 8. Lernen zwischen verschiedenen Denkräumen

Thinking Spaces sollen voneinander lernen können, ohne fremde lokale Erinnerungen lesen zu müssen.

```text
Thinking Space A                 Thinking Space B
private/team memory              private/team memory
       │                                │
       └───── Generalization Gate ──────┘
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

Geteilt werden **Wissensartefakte**, nicht Erinnerungsbestände.

## 9. Mögliche Sichtbarkeitsebenen

```text
private
  ↓
team
  ↓
organization / community
  ↓
shared commons
```

Die Sichtbarkeit ist Metadatum jedes Wissensobjekts und darf nicht implizit erweitert werden.

## 10. Schutz vor dem eigenen Lern-Bias

Ein lernender Denkraum kann eigene Defaults entwickeln. Deshalb muss Langzeitwissen revidierbar bleiben.

```yaml
learning:
  statement: ...
  evidence_for: 7
  evidence_against: 2
  confidence: medium
  status: provisional
  last_confirmed: ...
  scope: ...
```

Der Reviewer soll deshalb nicht nur Modell-Bias erkennen, sondern auch fragen:

> Welche Denkgewohnheiten hat dieser Thinking Space selbst entwickelt?

Ein reifer Denkraum kann damit auch seine eigene Geschichte irritieren.

## 11. Leitregel

> Ein selbstlernender theologischer Denkraum wird nicht dadurch klüger, dass er alles speichert, sondern dadurch, dass er Herkunft, Geltungsbereich, Schutzbedarf und Revidierbarkeit seines Wissens kennt.
