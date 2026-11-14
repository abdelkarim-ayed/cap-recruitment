# Chapitre 5 — Assistance documentaire et supervision humaine

## Introduction

L’assistance documentaire a été conçue pour répondre à quelques questions configurées sur un CV, sans transformer ces réponses en classement des personnes. Le résultat recherché est une information structurée que les ressources humaines peuvent confronter au document, corriger et exporter. Une certification mentionnée n’est pas une certification authentifiée ; un usage professionnel décrit n’est pas une mesure de maîtrise.

La réalisation relie un PDF privé, une lecture textuelle locale, une requête Jev multi-question et une revue par champ, selon la chaîne de la [[REF:DIA-05]]. Ce chapitre présente les choix d’intégration, les observations exploratoires qui ont éclairé les formulations et la conservation séparée du résultat original et des corrections humaines.

## 5.1. Jev et le contrat de questionnement

### 5.1.1. Un service de réponses typées

Jev est le modèle de décision proposé par TypeSafe. Son API reçoit un état documentaire et des questions dont les réponses admissibles sont définies à l’avance. CAP utilise directement le point d’accès `https://api.typesafe.ai/v1/systemone`, avec le modèle fixé à `jev-1.14.0`, sans intermédiaire de distribution. Le type retenu est `Choice` : chaque question possède des instructions et un dictionnaire de critères décrivant les catégories possibles [REF-JEV-API] [REF-JEV-INTRO].

Ce contrat convient au besoin retenu : rechercher un niveau de formation, une mention de certification, une tranche d’expérience ou un contexte d’utilisation. L’application n’a pas à interpréter un paragraphe libre pour retrouver une catégorie. En revanche, définir les catégories ne garantit pas que le modèle choisira la bonne : le typage résout un problème d’intégration, pas toute l’interprétation du CV.

La configuration relie chaque extracteur à un champ documentaire du formulaire et regroupe ses questions sous des identifiants stables. Plusieurs questions peuvent appartenir à la même famille. Les formulations sont construites par le domaine partagé ; le recruteur renseigne les paramètres utiles, et non un prompt libre donnant des commandes au fournisseur. Une offre peut aussi ne comporter aucun extracteur.

### 5.1.2. État, questions et critères

La requête courante contient trois éléments principaux : le modèle, un objet `state` avec le Markdown du CV et la date de référence, puis un objet `questions` indexé par les identifiants configurés. Chaque question contient son type `choice`, ses instructions et les critères de chaque réponse. Les noms et alias acceptés sont intégrés aux formulations. Le code construit une seule requête avec toutes les questions d’un extracteur ; cinq familles ne signifient donc pas cinq appels.

La réponse contient, pour chaque question, le choix retenu, une distribution de probabilités sur les options et une valeur de confiance. CAP vérifie le modèle, la présence de tous les identifiants, les catégories, les probabilités comprises entre zéro et un, leur somme et la cohérence du choix avec la distribution. Une réponse incomplète fait échouer l’extracteur entier ; elle n’est pas remplacée par des champs négatifs.

Les catégories sont ensuite normalisées en valeurs métier : booléen pour une certification, entier pour une couverture, catégorie pour les autres familles. Le résultat conserve à la fois ces champs et l’enveloppe originale, avec distributions, confiance, modèle et usage. Les exports utilisent les valeurs effectives décrites dans la [[REF:sec-review]], pas les probabilités comme scores de recrutement.

### 5.1.3. Exemple : d’une mention de certification à un champ révisable

Le CV synthétique de Daniel Mercer contient l’extrait « AWS Certified Developer-Associate (2023) » sous la rubrique `CERTIFICATIONS`. La question configurée porte l’identifiant exact `Certification`, le type `certification` et le paramètre `certification = {"name":"AWS Certified Developer – Associate","aliases":["DVA-C02"]}`. Le nom et l’alias alimentent les instructions ; les critères restent ceux de la famille, et non un texte libre du recruteur.

**Résultat enregistré — requête et réponse abrégées sans modification du sens.** Seuls l’extrait documentaire et la question de certification sont reproduits ; la requête complète contenait le CV entier et cinq questions regroupées.

```json
{
  "model": "jev-1.14.0",
  "state": {
    "cv": "[…]\n# CERTIFICATIONS\n\n- AWS Certified Developer-Associate (2023)\n[…]",
    "reference_date": "2026-10-15"
  },
  "questions": {
    "Certification": {
      "type": "choice",
      "instructions": "Does the CV state that AWS Certified Developer – Associate (also accept: DVA-C02) is held or completed? Related work, preparation and planned study do not count.",
      "criteria": {
        "present": "Stated as held or completed.",
        "not_mentioned": "Not evidenced as held or completed."
      }
    }
  }
}
```

```json
{"model":"jev-1.14.0","answers":{"Certification":{
  "type":"choice","choice":"present","confidence":1,
  "probabilities":{"present":1,"not_mentioned":0}
}}}
```

Le domaine convertit `present` en `true` : la certification est documentée comme détenue, sans être authentifiée. En revue, les RH peuvent confronter ce champ au PDF et conserver une correction indépendante. Sans correction, la valeur effective exportée reste `true`. À titre illustratif, une correction RH à `null` rendrait le champ « inconnu après revue », sans modifier la réponse originale enregistrée.

### 5.1.4. Interpréter la confiance

Selon la documentation TypeSafe, la confiance d’un `Choice` est calculée à partir de la probabilité de l’option sélectionnée et du nombre d’options : `confiance = (p_max − 1/n) / (1 − 1/n)`. Elle exprime l’écart au choix uniforme. Avec quatre options et une probabilité sélectionnée de 0,76, elle vaut 0,68. Cette valeur n’est pas un taux de justesse mesuré sur les CV de CAP [REF-JEV-CONFIDENCE].

Dans l’implémentation actuelle, ni la confiance ni la probabilité de l’option sélectionnée ne servent de seuil de filtrage. Elles restent conservées sans recalcul ni plafonnement. Une faible confiance peut inviter à examiner le document ; elle ne signifie automatiquement ni erreur, ni absence d’information. Inversement, une réponse concentrée peut rester sémantiquement contestable, comme l’illustre le cas Excel présenté plus loin.

## 5.2. Questions documentaires et référence temporelle

### 5.2.1. Les cinq familles

Les familles couvrent des indicateurs documentaires différents. Leurs critères sont conservés avec la configuration afin qu’une valeur ne soit pas lue hors de la question qui lui donne son sens.

[[TABLE:document-question-families]] Familles de questions et limites d’interprétation

| Famille | Valeur produite | Sens et limite |
|---|---|---|
| Formation | Niveau, du secondaire au doctorat, ou `not_stated` | Plus haut niveau admissible dans le périmètre et la fenêtre demandés ; pas une authentification de diplôme |
| Certification | Booléen | Le CV déclare la certification détenue ou achevée ; préparation et travail connexe ne suffisent pas |
| Expérience | Moins d’un an ; 1–<3 ; 3–<5 ; 5–<8 ; 8 ans ou plus | Durée de travail documentée, sans compter deux fois les chevauchements |
| Couverture de liste | Entier de zéro à la taille de la liste | Nombre d’éléments mentionnés ou décrits sans ambiguïté ; pas une note d’adéquation |
| Contexte d’une compétence | Non mentionnée ; déclarée ou étudiée ; appliquée hors travail ; utilisée professionnellement | Nature de la preuve explicite ; pas un niveau de compétence |

Pour la formation, une fenêtre positive en mois peut inclure un achèvement explicitement attendu après la date de référence. Une fenêtre absente ou nulle limite la question aux formations achevées. Le résultat ne comporte pas un second champ séparant « obtenu » et « attendu » : la fenêtre doit donc rester lisible lors de la revue. Les équivalences internationales peuvent également nécessiter une appréciation humaine.

Pour la certification, `false` signifie « non documentée comme détenue ou achevée », et non « la personne ne la possède pas ». Aucune interrogation d’un organisme émetteur, vérification d’expiration ou validation d’authenticité n’est réalisée.

Pour l’expérience, les instructions demandent du temps écoulé, pas un décompte d’années civiles. Elles interdisent d’attribuer à une compétence listée toute la durée d’un poste voisin. La première tranche inclut explicitement l’absence de durée étayée : « moins d’un an » ne distingue donc pas une expérience courte d’une durée non documentée. C’est une simplification de la représentation actuelle, à conserver dans l’interprétation des résultats.

La couverture porte sur une liste de un à 254 éléments, comptés une seule fois chacun. Le contexte d’une compétence porte au contraire sur un élément : une simple liste reste une déclaration, tandis qu’un projet personnel constitue une application non professionnelle. Des alias peuvent préciser les termes acceptés, mais ils sont directionnels. Accepter « T-SQL » pour rechercher SQL ne construit pas une équivalence universelle ; accepter Excel ne doit pas assimiler tout tableur à ce produit.

### 5.2.2. Une date fixée à la première publication

La date UTC de première publication réussie de l’offre sert de référence commune aux candidatures. La création du brouillon ne fixe pas cette date. La publication l’enregistre après vérification des révisions attendues, puis elle est portée par l’instantané de candidature. Un traitement retardé ou une reprise ne la remplace pas par la date d’exécution. La prévisualisation d’un brouillon utilise une date provisoire explicitement indiquée.

Ce choix stabilise les questions temporelles entre candidats d’une même offre. Il a aussi un compromis : pour une offre ouverte longtemps, la référence vieillit. Une date de dépôt décrirait mieux le contexte propre à chaque candidature, mais ne donnerait plus une référence identique à toutes. Le prototype privilégie la stabilité ; il ne réalise pas de rafraîchissement automatique de cette référence.

## 5.3. Du PDF privé à la requête

### 5.3.1. Lecture native locale

Le lecteur utilise `@firecrawl/pdf-inspector` en version 1.25.2, par ses fonctions natives asynchrones de classification et de conversion en Markdown. Le calcul reste local sur CPU ; le service Jev reçoit le texte préparé, pas les pages converties en images. L’appel s’exécute dans un processus enfant interruptible qui n’hérite pas des secrets du backend [REF-PDF-INSPECTOR].

[[FIG:DIA-05]]

*Figure — Du PDF privé aux réponses typées, puis à la revue humaine. La préparation textuelle et la réponse fournisseur disposent de caches distincts.*

Le traitement est borné à 10 Mio, vingt pages, 60 000 caractères de Markdown et huit secondes. Le processus enfant reçoit une limite de tas V8 de 192 Mio ; celle-ci ne borne pas toutes les allocations natives. Un texte vide, un dépassement ou des pages nécessitant un OCR produisent un échec explicite, sans troncature destinée à obtenir malgré tout une réponse. Le lecteur livré ne prend pas en charge les scans ni le DOCX, même si un formulaire peut accepter ce dernier au dépôt.

Les diagnostics signalent notamment colonnes, tableaux et problèmes d’encodage. Ils aident à expliquer un texte intercalé ou une relation perdue entre dates et postes, mais ne constituent pas une note de qualité. Un avertissement n’invalide pas nécessairement toutes les réponses ; son absence ne garantit pas un ordre de lecture correct. Aucun secours OCR ou hébergé n’est déclenché automatiquement.

### 5.3.2. Caches et exécution différée

Le dépôt d’une candidature enregistre les tâches avant de réveiller le traitement en arrière-plan ; la réponse au candidat n’attend pas Jev. Les signaux de réveil sont complétés par un balayage périodique de la base. Les extracteurs sont exécutés séquentiellement, avec contrôle de l’éligibilité avant persistance : un verrouillage de revue ou une libération du traitement ne doit pas être contourné par un résultat tardif.

Deux caches persistants évitent de confondre réutilisation documentaire et réutilisation d’inférence. Le cache de lecture dépend de l’empreinte du PDF, de la version du lecteur et de ses options. Le cache de réponse dépend de la requête effective complète : texte, modèle, date, questions, critères, alias et ordre de sérialisation. Changer les questions change donc l’identité de la réponse, même pour le même fichier. Les entrées sont privées, vérifiées à la lecture et écrites par remplacement atomique.

La passerelle unique contrôle les envois réels. Un registre durable distinct conserve la connaissance des tentatives ; le cache ne tient pas lieu de preuve d’absence d’envoi. Après un envoi incertain, perdre la réponse n’autorise pas un nouvel appel. Un succès validé est mis en cache avant son enregistrement en base, ce qui permet une récupération locale sans nouveau transport lorsque l’historique l’autorise. La validation sous pannes et concurrence de cette reprise reste à compléter, comme indiqué au [[REF:chapter-6]].

Les limites locales d’un appel actif, de trois admissions par minute et de vingt admissions persistantes encadrent la démonstration. Elles ne décrivent pas une capacité de production. La politique conserve les erreurs comme erreurs : une indisponibilité du lecteur ou du fournisseur ne devient ni une certification absente, ni une couverture nulle.

## 5.4. Développement exploratoire des questions

### 5.4.1. Construction et méthode

L’exploration a été conduite dans un laboratoire séparé avant l’intégration TypeScript. Les contenus synthétiques ont fait varier métiers, ancienneté, langue, qualifications achevées ou en cours et descriptions explicites ou ambiguës, puis leur mise en page. La préparation séparait le contenu du candidat et son adaptation à un modèle de CV ; les consignes de plausibilité évitaient de remplir mécaniquement toutes les rubriques. Les fichiers de travail et les PDF exportés conservent cette démarche.

Le corpus archivé comprend 63 PDF synthétiques répartis sur treize familles de modèles : soixante identités numérotées, deux variantes de mise en page et un CV supplémentaire. Les sorties de lecture native sont conservées à côté de leur provenance. Les documents effectivement questionnés constituent un sous-ensemble du corpus.

Les essais ont associé questions positives, absences et notions voisines ne satisfaisant pas le critère demandé. Les réponses ont motivé des comparaisons de formulations, notamment pour le comptage d’éléments, le lien entre produit et activité, et les durées. Dans le laboratoire local original, un schéma JSON décrit les paramètres par famille ; un gabarit Jinja transforme identifiants, noms et alias en instructions et critères `Choice`. Un outil en ligne de commande charge la requête native construite et y remplace `$cv` par le texte documentaire avant validation. Ces règles ont ensuite été portées dans le domaine TypeScript. Les formulations historiques ne sont pas toutes identiques à celles de la version intégrée.

[[TABLE:execution-modes]] Artefacts et modes d’exécution

| Artefact ou mode | Contenu | Usage dans l’analyse |
|---|---|---|
| Archive de laboratoire | Vingt paires exactes requête-réponse, totalisant 102 réponses historiques | Retrouver le texte, la question et la sortie observée d’une exploration |
| Cache de réponse de l’application | Réponse validée pour une requête effective et un mode déterminés | Réutiliser un résultat existant ; un accès au cache n’est pas une nouvelle observation indépendante |
| Fixture de démonstration | Réponse prédéfinie, explicitement simulée | Montrer des états et interactions sans attribuer ces réponses au modèle réel |
| Exécution réelle | Lecture native puis requête via la passerelle Jev, hors réutilisation d’un succès | Observer le comportement du service sur l’entrée effectivement envoyée |

Les variantes d’une même identité et les questions répétées restent liées ; les lectures provisoires de développement ne constituent pas une vérité de référence indépendante.

### 5.4.2. Cas observés

Les extraits ci-dessous proviennent du texte effectivement présent dans les requêtes archivées. Les questions sont résumées en français en conservant leur sens. Les probabilités et catégories sont celles des réponses enregistrées ; la colonne d’interprétation reprend la lecture de développement, avec ses réserves.

[[TABLE:recorded-extraction-cases]] Réponses enregistrées et enseignements documentaires

| Question | Extrait documentaire envoyé | Réponse observée | Interprétation et enseignement |
|---|---|---|---|
| Plus haut diplôme achevé en plomberie | « CAP Monteur en installations sanitaires, en cours » | `not_stated`, probabilité 1,00 | Conforme à la lecture provisoire « achevé seulement » ; la mention d’un diplôme ne suffit pas à le déclarer obtenu |
| Contexte du remplacement de joints ; contexte de la réparation de robinets | Emploi : « Aide au remplacement de joints […] sous supervision » ; bénévolat : « aide à réparer robinets […] sous encadrement » | Joints : `used_professionally`, 0,99 ; robinets : `applied`, 0,99 | La distinction observée porte sur emploi et bénévolat, pas sur présence ou absence de supervision |
| Contexte d’usage de Microsoft Excel | Liste : « Excel » ; projet : « Created a monthly spreadsheet for a community repair café » | `applied`, probabilité 0,76, confiance 0,68 | Le projet ne nomme pas Excel. Sous la règle de lien explicite retenue, la lecture provisoire reste « déclaré ou étudié » ; le modèle a relié deux mentions sans preuve suffisante du produit utilisé |
| Durée d’expérience en service client | Postes à partir de « 2019 – 2021 », puis jusqu’à « Present » ; référence au 12 novembre 2026, courte interruption non détaillée | `5_to_under_8`, probabilité 0,67 ; option `8_plus` à 0,32 | Le choix principal est plausible, mais la tranche huit ans ou plus est incompatible avec la période maximale documentée. La distribution ne remplace pas un calcul de durée vérifié |

Le cas Excel a fait l’objet d’une comparaison plus stricte sur le même document. Pour le Markdown original, la probabilité d’« appliqué » passe de 0,85 avec la première formulation à 0,58 avec la seconde, mais le choix retenu reste « appliqué ». Une version modifiant seulement la mise en forme du texte ne corrige pas ce choix ; la variante stricte y aboutit à une égalité à la précision publiée entre « déclaré » et « appliqué ». La reformulation déplace la distribution sans résoudre l’erreur de liaison selon la lecture retenue.

Un contrôle positif sur un autre CV, en espagnol, conserve au contraire l’usage professionnel d’Excel et la simple déclaration de Python pour les deux formulations comparées. Il montre que le durcissement n’efface pas cet exemple explicite ; il ne valide pas tous les contextes de compétence. Pour une liste de réception, suivi de rendez-vous, Excel et paie, une comparaison sur un CV français renvoie deux éléments avec les deux formulations, avec des probabilités de 0,87 et 0,94. Un ancien compte de trois n’y est pas reproduit : le contexte de requête a changé, ce qui interdit d’attribuer la différence à la seule reformulation.

### 5.4.3. Enseignements retenus

Ces essais ont précisé trois exigences de conception. D’abord, une mention et son contexte doivent rester distincts : la présence d’un produit dans une liste ne prouve pas son utilisation dans un projet voisin. Ensuite, les dates imprécises et les équivalences de qualification ne se résolvent pas par une confiance élevée. Enfin, les alias doivent exprimer des acceptations choisies, pas élargir les concepts pour faire disparaître un contre-exemple.

La version intégrée conserve des consignes explicites sur ces frontières, sans présenter les reformulations comme une correction générale démontrée. La sélection automatique d’extraits justificatifs et l’assistance à la constitution d’alias restent des prolongements possibles, non des résultats livrés. Le réglage ayant utilisé ces documents, une évaluation finale devrait réserver d’autres cas à l’examen de la version figée.

## 5.5. Estimation du coût fournisseur

Le tarif public direct de TypeSafe consulté pour ce rapport est de 0,042 USD par million de tokens d’entrée ; les sorties sont gratuites dans le plan standard décrit. Il correspond au fournisseur appelé par CAP. Le nombre de tokens doit inclure le document et la totalité des questions et critères de la requête [REF-JEV-PRICE].

Pour une requête, `C = T_entrée × 0,042 / 1 000 000`. Les scénarios suivants supposent un extracteur par document et une requête par extracteur, sans réutilisation de cache.

[[TABLE:jev-cost-projections]] Coûts fournisseur projetés selon le volume de tokens

| Tokens d’entrée par requête | Coût par requête, USD | Pour 1 000 requêtes, USD | Pour 1 000 000 de requêtes, USD |
|---|---:|---:|---:|
| 2 000 | 0,000084 | 0,084 | 84 |
| 5 000 | 0,000210 | 0,210 | 210 |
| 8 000 | 0,000336 | 0,336 | 336 |

Ce tableau est une projection tarifaire, pas une moyenne mesurée ni une borne déduite du nombre de pages. Il n’annonce pas la capacité de traiter ces volumes avec les limites locales de démonstration. Hébergement, stockage, lecture CPU, exploitation et revue humaine restent hors de cette estimation. Le regroupement des questions et les caches réduisent les échanges nécessaires dans certains cas, sans établir ici un gain de temps ou une économie globale face à un ATS complet.

## 5.6. Revue humaine et valeur effective
[[LABEL:sec-review]]

### 5.6.1. Original et correction indépendante

Le résultat original réussi est conservé sans réécriture. Une correction distincte porte sur une question d’une tâche et d’une candidature, avec auteur et date. La valeur effective est la correction lorsqu’elle existe, sinon l’original. Une confirmation humaine identique à l’original conserve ainsi une provenance différente d’une absence de correction.

[[FIG:DIA-07]]

*Figure — Le résultat original et la correction indépendante déterminent la valeur effective du champ.*

Une valeur nulle explicitement corrigée signifie « inconnu après revue » et prévaut sur la machine. Retirer la correction rétablit l’original. Omettre un champ dans une sauvegarde conserve son état ; zéro et faux restent des valeurs valides.

[[TABLE:review-effective-values]] Effet illustratif des corrections RH sur la valeur effective

| Exemple illustratif de couverture | Original | Correction | Valeur effective |
|---|---:|---|---|
| Sans correction | 3 | Absente | 3, source machine |
| Correction à zéro | 3 | 0 | 0, source RH |
| Inconnu après revue | 3 | `null` | Indisponible, source RH |
| Correction retirée | 3 | Absente | 3, source machine |

Les exports utilisent ces valeurs effectives. Le format diagnostic ajoute l’état et la provenance pour comprendre une indisponibilité ; le format compact privilégie les informations utiles à la décision. L’import de décisions reste un autre mécanisme : il n’écrase pas les résultats documentaires.

### 5.6.2. Consultation et clôture de la revue

L’écran de revue associe les champs au PDF source et permet une correction ciblée. Il distingue lecture, enregistrement, libération du traitement restant et achèvement de la revue. Les conflits conservent le brouillon local et demandent un rafraîchissement suivi d’une réapplication explicite, selon les mécanismes de révision présentés au [[REF:chapter-3]].

[[FIG:CAP-12]]

*Figure — Consultation du PDF source et revue RH des valeurs documentaires, avec correction par champ.*

La libération manuelle renonce au traitement restant sans transformer les échecs en succès. Elle ne termine pas la revue et ne présélectionne pas le candidat. L’achèvement de revue ou une décision de présélection/rejet verrouille ensuite les écritures correspondantes. La disponibilité technique d’un résultat n’est donc pas une approbation humaine.

Les résultats et corrections sont réservés aux projections RH ; les vues candidat et interviewer n’exposent pas ces données internes. Markdown, caches et exports demeurent des dérivés sensibles du document. Le CV constitue un texte non fiable, distinct des questions construites par le code. Cette séparation et le typage ne démontrent pas une immunité aux injections ; les cas adversariaux restent à vérifier. Les conditions d’usage et de conservation sont reprises au [[REF:chapter-6]].

## Conclusion

L’assistance réalisée relie des questions configurables à une information inspectable : texte préparé localement, réponse typée complète, original conservé, correction indépendante et export effectif. L’exploration a permis de préciser les catégories et de conserver des contre-exemples concrets, notamment sur le lien entre outil nommé et activité générique. Ces résultats qualitatifs éclairent l’usage de l’assistance ; le chapitre suivant situe leur portée parmi les vérifications de l’ensemble de la plateforme.
