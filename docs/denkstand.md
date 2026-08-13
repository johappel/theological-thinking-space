# Denkstand

Stand: 13. August 2026

## 1. Problemstellung

Sprachmodelle bringen bei „Gottesdienst“, „Liturgie“ und religiöser Sprache starke statistische Defaults mit. Ein formal kreativer Entwurf kann deshalb kulturell und theologisch erstaunlich konventionell bleiben: Predigtzentrierung, Moderation–Lied–Gebet–Input–Response, individualisierte Glaubenssprache, Gemeinde als Publikum oder Musik als emotionale Verstärkung.

Der Theological Thinking Space soll diese Muster nicht nur durch bessere Prompts vermeiden. Das Problem wird als **epistemisches Architekturproblem** verstanden: Welche Perspektiven gelangen wann in den Denkraum? Wer sieht welchen Kontext? Wie werden Widerspruch, Fremdheit, Tradition und Quellenherkunft sichtbar?

## 2. Kontext

Der gegenwärtige Schwerpunkt liegt auf einem deutschsprachigen evangelischen Kontext. Agenda 1 ist dabei weder Feindbild noch Default, sondern eine Referenz unter anderen. Interreligiöse Perspektiven sollen nicht dekorativ eingestreut werden, sondern als echte Gegenperspektiven wirken können.

## 3. Leitprinzipien

### Kein erster Entwurf

Auf eine offene Anfrage wie „Gottesdienst zu Einsamkeit“ soll das System zunächst keinen Ablauf generieren. Vor der Form stehen mindestens:

- Kontext und Teilnehmende,
- erfahrungsbezogene Frage,
- theologische Spannung,
- mögliche rituelle Handlungen,
- Gegenperspektiven und blinde Flecken.

### Perspektivraum statt Allwissenheit

Die KI soll nicht behaupten, „zu wissen, wie Gottesdienst geht“. Der Denkraum wird situativ aus unterschiedlichen Perspektiven zusammengesetzt.

### Perspective Refresh

Recherche dient nicht primär dazu, Vorlagen zu finden, sondern den bisherigen Denkraum gezielt zu irritieren. Gesucht werden wenige, sorgfältig ausgewählte Fremdperspektiven, jeweils mit Herkunft und einer daraus entstehenden Frage.

### Funktionale Rekonstruktion statt bloßer Formvariation

Tradierte Liturgie wird zunächst daraufhin befragt, welche Funktionen sie erfüllt – etwa Sammlung, Anrufung, Wort, Antwort, Sendung. Danach kann geprüft werden, ob und wie dieselben Funktionen anders realisiert werden können.

### Provenienz und epistemische Kennzeichnung

Eine eingebrachte Perspektive soll unterscheidbar bleiben, z. B. nach:

- Tradition / Kontext,
- Autor:in oder Quelle,
- Disziplin,
- Konfession / Religion,
- Erscheinungsjahr,
- Beobachtung / Forschung / normative Position.

## 4. Perspektivlinsen

Mögliche spezialisierte Perspektiven sind:

- **Liturgische Linse:** Ritual, Schwelle, Wiederholung, Körper, Zeit, Raum, Symbol, Schweigen.
- **Theologische Linse:** implizites Gottesbild, Handlungsträger, Offenheit und Behauptung.
- **Teilnehmenden-Linse:** Erfahrung kirchlich nicht sozialisierter, nicht textsicherer oder glaubensunsicherer Menschen.
- **Macht-Linse:** Wer spricht für wen? Wer darf deuten? Wer wird Objekt einer Botschaft?
- **Ästhetische Linse:** Ist etwas tatsächlich rituell – oder nur eine Predigt mit Medien?
- **Interreligiöse Linse:** Welche vermeintlich allgemeinen Aussagen sind spezifisch christlich? Wo widersprechen andere Traditionen produktiv?
- **Religionslose Linse:** Was bleibt erfahrbar, wenn Glaubensvoraussetzungen nicht geteilt werden?

## 5. Bias-/Default-Review

Ein eigener Reviewer soll nicht nur Safety prüfen, sondern strukturelle Defaults sichtbar machen. Beispielsweise:

- Predigt als epistemisches Zentrum,
- individuelle Entscheidungs- oder Bekehrungssprache,
- Musik als emotionale Verstärkung,
- Gemeinde als Publikum,
- behauptete Innovation bei unveränderter Rollenverteilung.

Der Reviewer soll solche Muster benennen und zurückfragen, ob sie beabsichtigt sind.

## 6. Multi-Agent-Denkraum

Die bisherige Orientierung lautet:

> **shared artifact + shared structured memory + conversational event stream**
>
> plus
>
> **private perspective memory + selektiver Kontext**

Die Agenten sollen also nicht unabhängig nacheinander denselben Entwurf reviewen. Sie arbeiten an einem gemeinsamen Gegenstand und können relevante Beiträge anderer Perspektiven wahrnehmen, ohne ihre eigene Rolle durch vollständige Kontextvermischung zu verlieren.

Vorläufige Rollen:

- **Companion** – denkt mit dem Menschen und hält die Frage offen.
- **Knowledge** – erschließt Traditionen, Diskurse und Quellen mit Provenienz.
- **Worker / Scout** – sucht gezielt Fremdperspektiven und Irritationen.
- **Perspective Agents** – betrachten den Gegenstand durch klar definierte Linsen.
- **Reviewer** – entdeckt Verengungen, versteckte Defaults und Scheininnovation.

## 7. Noch offene Fragen

- Wie viel vom gemeinsamen Event Stream benötigt jede Perspektive wirklich?
- Wann soll ein Agent auf andere Agenten reagieren dürfen und wann zunächst unabhängig beobachten?
- Was gehört in den gemeinsamen Denkstand, was bleibt bewusst perspektivisch und privat?
- Wie verhindert man, dass ein „shared memory“ früh einen Konsens erzwingt?
- Wie werden Quellen und epistemischer Status in der UI sichtbar, ohne den Denkfluss zu überfrachten?
- Welche Rolle übernimmt der Mensch: Moderator:in, Mitdenkende:r, Kurator:in, Entscheider:in – oder wechselnd alles davon?

## 8. Nächste Hypothese

Bevor eine komplexe Agentenplattform gebaut wird, soll ein kleiner Prototyp prüfen, ob sich folgende Situation bereits produktiv anfühlt:

> Ein Mensch arbeitet an einem gemeinsamen Gottesdienst-Gegenstand. Drei klar unterscheidbare Perspektiven sehen denselben aktuellen Entwurf und einen kleinen gemeinsamen Denkstand. Sie können gezielt aufeinander Bezug nehmen. Keine Perspektive besitzt automatisch den gesamten Gesprächsverlauf. Der Mensch entscheidet, welche Spur vertieft oder in den gemeinsamen Denkstand übernommen wird.
