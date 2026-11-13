# Chapitre 2 — Analyse des besoins et étude des solutions existantes

## Introduction

Le cadrage de CAP définit une frontière ; l’analyse des besoins doit montrer pourquoi cette frontière conduit à certaines fonctions et à certains choix techniques. Il ne suffit pas d’énumérer publication, dépôt, entretien et intelligence artificielle. Il faut comprendre quelles informations circulent, qui peut les transformer et quelles conséquences doivent rester explicites. La même exigence vaut pour l’étude de l’existant : une plateforme de recrutement complète, un parseur de CV et un tableur ne répondent pas au même niveau du problème.

Ce chapitre établit le parcours attendu, les besoins fonctionnels et les exigences transversales. Il confronte ensuite les choix de CAP à des catégories de solutions documentées par des sources officielles. Le panorama est une analyse d’adéquation, pas un benchmark : aucun produit concurrent n’a été exécuté dans le cadre de cette étude. Les fonctionnalités annoncées par leurs éditeurs servent à caractériser les options, sans reprendre leurs promesses de performance comme des résultats indépendants.

## Le parcours attendu et ses distinctions essentielles

### Préparer l’offre avant d’accueillir les candidatures

Le parcours commence avec une offre en brouillon. Son propriétaire définit les informations attendues du candidat, les documents demandés, les éventuelles questions d’extraction et le plan d’entretien. Le formulaire ne se limite donc pas à un texte d’annonce : il fixe un contrat de dépôt. Les éléments enregistrés doivent être cohérents avant publication, car la configuration est ensuite figée. Un plan sans extraction et un plan sans entretien sont des configurations valides, et non des erreurs à compenser par des étapes fictives [REF-CAP-PARCOURS].

La publication constitue une frontière métier. Une candidature doit être interprétée selon la définition effectivement publiée, pas selon une modification ultérieure du brouillon. La date de référence utilisée pour certaines questions documentaires est également fixée lors de la première publication réussie. Cela évite qu’une même formulation relative au temps change silencieusement de sens au gré des traitements. Les détails des instantanés et des révisions relèvent de la conception ; le besoin est ici celui d’un contexte stable et explicable [REF-CAP-TRAITEMENT].

### Déposer sans dépendre d’une interprétation distante

Le candidat authentifié renseigne le formulaire et transmet les pièces demandées. Le système doit confirmer le dépôt indépendamment de l’analyse éventuelle du CV. Une interruption du fournisseur d’IA ne doit pas remettre en cause une candidature déjà reçue. Le traitement est donc séparé de la requête de soumission : les informations sont d’abord conservées, puis les travaux configurés peuvent être exécutés en arrière-plan.

Le contenu soumis devient immuable. Cette règle protège le sens du dossier examiné : une correction RH ne transforme pas rétroactivement une déclaration du candidat. Le dépôt unique par candidat et par offre évite aussi que plusieurs onglets ne produisent plusieurs dossiers concurrents pour la même relation. Il ne s’agit pas de fusionner toutes les candidatures d’une personne dans un profil global indistinct, mais de préserver un dossier lié à une offre déterminée [REF-CAP-PRODUIT].

### Examiner, décider et finaliser sans confusion

Trois dimensions se superposent sans se confondre. Le **traitement** décrit l’exécution des tâches automatiques. La **revue** décrit l’examen et les corrections humaines de leurs résultats. Le **recrutement** décrit les décisions et la progression de la candidature. Une extraction terminée n’est pas une présélection ; une revue achevée n’est pas une approbation du candidat. Inversement, les RH peuvent décider avant la fin d’une extraction si les informations déjà disponibles leur paraissent suffisantes [REF-CAP-PARCOURS].

La présélection ouvre la poursuite du parcours. Si des entretiens sont configurés, ils sont planifiés et affectés à un responsable. Celui-ci soumet une appréciation finale, avec une issue Pass ou Fail. Un Pass n’enregistre pas automatiquement une proposition. Après réussite de tous les entretiens requis, ou directement après présélection lorsque le plan est vide, le propriétaire peut enregistrer explicitement une **proposition**. L’**embauche** est un acte ultérieur distinct. Dans ce rapport, « offre » désigne donc le poste publié ; « proposition » désigne l’étape interne correspondant à Offer [REF-CAP-PARCOURS].

**Exemple conceptuel.** Deux candidatures concernent deux offres distinctes, toutes deux sans entretien. La première offre ne configure aucun extracteur ; la seconde en configure un pour le CV, dont le traitement échoue sur la candidature considérée. Les RH peuvent lire les deux dossiers et prendre une décision explicite. Le dossier en échec ne doit pas être affiché comme satisfaisant une condition documentaire, mais son échec technique ne vaut pas rejet. Cet exemple illustre l’indépendance du recrutement ; il ne constitue pas un scénario exécuté ni une recommandation de sélection.

## Besoins fonctionnels et autorité des acteurs

### Gérer l’offre et le dossier dans leur contexte

Le premier groupe de besoins concerne la préparation et la conservation du contexte. Les RH doivent pouvoir créer une offre ; son propriétaire doit pouvoir enregistrer son brouillon, inspecter le formulaire, vérifier le plan sauvegardé et publier en connaissance des conséquences. Les autres membres RH peuvent consulter les informations autorisées sans obtenir, par cette consultation, le droit de modifier la configuration. La fermeture doit arrêter les dépôts tout en laissant lisible le recrutement existant.

Pour le candidat, le besoin est celui d’une entrée sans ambiguïté. Il doit savoir s’il a déjà postulé et retrouver sa candidature, y compris lorsque l’offre est fermée. Une réponse de chargement incertaine ne doit pas ouvrir un formulaire sans contrôle préalable. Après dépôt, sa consultation présente ses informations soumises et une progression publique limitée, jamais une copie du dossier interne RH [REF-CAP-INTERFACE].

Le dossier interne doit réunir réponses, pièces et résultats, mais avec une séparation visible de leurs origines. La revue demande la consultation de la source et la correction de champs déterminés. Elle ne doit pas devenir une opération globale qui remplace les réponses du candidat ou masque les résultats originaux. Les valeurs indisponibles doivent conserver un sens distinct d’une réponse négative.

### Articuler rôle, relation à la ressource et état

La matrice ci-dessous synthétise les responsabilités principales. Elle décrit des besoins d’autorité contextualisée ; les contrats détaillés précisent les conditions de chaque commande.

| Acteur ou position | Action attendue | Contexte nécessaire | Limite essentielle |
| --- | --- | --- | --- |
| Candidat | Déposer une nouvelle candidature | Identité vérifiée, offre publiée et ouverte au dépôt | Un dossier par offre |
| Candidat | Consulter sa candidature existante | Session authentifiée et candidature lui appartenant, même après fermeture de l’offre | Aucune note interne accessible |
| Recruteur ou administrateur | Créer une offre, consulter les dossiers | Rôle autorisé et périmètre de l’entreprise | Créer ne signifie pas modifier les offres d’autrui |
| Propriétaire de l’offre | Modifier, publier, fermer | Propriété persistée et état compatible | Configuration non réouverte après publication |
| RH partagés | Corriger et terminer la revue | Travaux normalement terminés ou libération manuelle explicite | Revue terminée ou présélection engagée : corrections verrouillées |
| RH partagés | Présélectionner ou rejeter | Candidature encore indécise | Ni traitement ni revue obligatoirement terminés |
| RH partagés | Planifier les entretiens | Candidature et entretien configuré éligibles | Affectation et contraintes de rendez-vous contrôlées |
| Interviewer affecté | Soumettre l’évaluation finale | Affectation courante, horaire atteint et rendez-vous ouvert | Pas d’évaluation générale de tous les dossiers |
| Propriétaire de l’offre | Enregistrer proposition puis embauche | Prérequis du parcours satisfaits | Deux commandes distinctes ; aucun automatisme après Pass |

La notion de propriétaire n’ajoute pas un nouveau rôle global : elle décrit une relation à une offre. De même, l’affectation relie une personne à un rendez-vous. Cette distinction évite une matrice trop grossière dans laquelle « administrateur » signifierait tout pouvoir et « interviewer » donnerait accès à tous les candidats. Les autorisations effectives combinent le rôle reconnu par la session et les données actuelles chargées par le serveur [REF-CAP-ARCHITECTURE].

L’interface doit traduire ces conditions sans devenir une console remplie de commandes inaccessibles. Un utilisateur peut inspecter un formulaire publié sans voir un éditeur désactivé. Les actions pertinentes sont placées auprès de leur objet, et les décisions irréversibles demandent une confirmation ciblée. Ce besoin de lisibilité accompagne la sécurité, sans la remplacer : masquer un bouton ne suffit pas à refuser une requête forgée [REF-CAP-INTERFACE].

### Soutenir la revue facultative et la décision explicite

L’assistance documentaire exige des questions compréhensibles et des sorties exploitables. Le périmètre actuel couvre des familles relatives à la formation, à une certification, à l’expérience, à la couverture d’une liste et aux indices documentaires concernant une compétence. Ces réponses restent des interprétations de ce que mentionne le CV. La mention d’une technologie ne démontre pas sa maîtrise, et la description d’une formation ne prouve pas systématiquement un diplôme obtenu [REF-CAP-TRAITEMENT].

Les RH doivent pouvoir poursuivre lorsque des valeurs manquent. L’ouverture de la revue se fonde normalement sur l’achèvement des travaux configurés, mais une libération manuelle explicite permet de fermer le traitement restant sans fabriquer un succès. La décision de présélection possède son propre contrôle : elle peut intervenir indépendamment, puis rendre les résultats et corrections non modifiables. Le système doit préserver cet état réel plutôt qu’inventer une revue terminée.

## Exigences non fonctionnelles

### Confidentialité et intégrité de l’information

La confidentialité demande davantage qu’une authentification à l’entrée. Chaque lecture doit respecter son contexte : propre candidature, dossier RH ou rendez-vous affecté. Les téléchargements documentaires doivent rester authentifiés ; un export ne doit pas transformer les liens des pièces en accès publics. Les projections candidat ne doivent pas contenir les motifs internes de rejet, les évaluations ou les états techniques de travail [REF-CAP-PRESELECTION].

L’intégrité comporte une dimension technique et une dimension sémantique. Techniquement, l’identité de la candidature, ses pièces et la décision doivent rester cohérentes. Sémantiquement, un résultat non disponible ne doit pas être normalisé en faux ou en zéro. La valeur effective doit pouvoir être expliquée par la correction RH existante ou, en son absence, par le résultat original. Ces propriétés justifient des contrats de données explicites, même dans un prototype.

### Concurrence, disponibilité et maîtrise économique

Le travail partagé crée un besoin de détection des conflits. Une version obsolète ne doit pas écraser silencieusement une modification plus récente. Le système doit signaler le conflit et laisser l’utilisateur comparer puis réappliquer volontairement son travail. Des révisions séparées distinguent notamment les modifications de revue et les décisions de recrutement ; tout changement d’extraction ne doit pas invalider artificiellement un projet de présélection [REF-CAP-PARCOURS].

La disponibilité concerne d’abord le parcours candidat et les fonctions manuelles. Le dépôt doit survivre à l’indisponibilité de l’assistance. Les échecs de traitement doivent apparaître comme tels, avec des états lisibles. Un traitement interrompu ne devient pas automatiquement une revue prête, et fermer logiquement un travail ne signifie pas annuler une facturation déjà engagée.

La maîtrise des dépenses constitue ainsi une exigence de sûreté. Une reprise ne peut pas supposer qu’une requête incertaine n’a rien coûté. Le contrat actuel sépare l’enregistrement durable des tentatives, la réponse mise en cache et la persistance du résultat métier. L’objectif est de refuser un nouvel envoi payant lorsqu’une tentative antérieure est ambiguë, quitte à limiter la disponibilité de la reprise. La vérification complète de ces situations de panne et de concurrence reste distincte de la description de source [REF-CAP-TRAITEMENT].

| Exigence | Traduction retenue | Question d’acceptation |
| --- | --- | --- |
| Accès privé | Projections par acteur et téléchargement autorisé | Un lien partagé révèle-t-il une pièce à un tiers non autorisé ? |
| Contexte stable | Configuration figée et instantané du dépôt | Le dossier conserve-t-il la définition réellement soumise ? |
| Travail partagé cohérent | Verrous transactionnels et révisions ciblées | Une écriture obsolète est-elle refusée sans écrasement ? |
| Dépôt indépendant | Traitement après validation du dépôt | Une panne d’assistance laisse-t-elle la candidature reçue ? |
| Coût borné | Passerelle contrôlée et tentatives durables | Une tentative ambiguë peut-elle déclencher un second envoi ? |
| Lisibilité | États séparés, confirmations et provenance | L’utilisateur distingue-t-il inconnu, négatif et corrigé ? |
| Portabilité | Contrats partagés, adaptateurs et CSV | Une évolution d’outil impose-t-elle de réécrire les règles métier ? |

Ces questions forment une grille d’acceptation, non une liste de résultats déjà obtenus. La documentation de statut conserve les vérifications datées et les gates ouvertes [REF-CAP-STATUT]. La portabilité ne signifie pas absence de dépendances : elle demande que celles-ci soient identifiées, remplaçables à une frontière raisonnable et accompagnées de conditions d’exploitation explicites.

## Panorama raisonné des solutions existantes

### Les ATS généralistes : organiser le parcours

Un *Applicant Tracking System*, ou ATS, centralise les candidatures et le suivi du recrutement. Le glossaire officiel de Greenhouse décrit la collecte des dossiers, les étapes, les retours d’entretien, les rapports et les intégrations. Il souligne aussi les questions d’utilisabilité et de gouvernance des données lors du choix d’un outil [REF-ATS-GREENHOUSE]. Cette description situe CAP dans une famille existante ; elle ne permet pas de prétendre que la centralisation serait une innovation absente du marché.

Workable documente une suite plus large associant recrutement, entretiens, rôles, intégrations de calendrier, rapports et fonctions de gestion des salariés. Son catalogue mentionne aussi des résumés et scores assistés par IA, des exports Excel, CSV ou PDF et une API développeur [REF-ATS-WORKABLE]. CAP ne peut donc pas justifier son existence en affirmant que les ATS ne proposent ni IA, ni personnalisation, ni échanges externes. Il sélectionne une partie du problème avec ses propres règles, notamment l’indépendance de la revue, de la présélection et de la finalisation.

L’adoption d’un ATS existant est une alternative sérieuse. Elle peut éviter de construire et maintenir une grande partie des fonctions courantes. En contrepartie, l’organisation doit examiner le contrat de service, la configuration, la migration, les droits, l’hébergement et l’adaptation de ses pratiques au produit. Le développement spécifique procure une maîtrise plus directe des règles, mais transfère l’effort vers la maintenance, l’exploitation et la validation. Aucun élément disponible ne démontre qu’un ATS commercial serait inadapté ou trop coûteux pour BeeCoders ; un choix d’achat réel demanderait une étude propre.

### Les parseurs spécialisés : structurer un document

Un parseur de CV ne remplace pas un ATS. Il transforme un document en données exploitables par un autre système. Textkernel présente un service d’extraction, de classification et de normalisation des informations des CV et des offres. Sa page officielle documente une API renvoyant du JSON, différents formats d’entrée et des options comme l’OCR ou les champs personnalisés FlexRequests [REF-PARSER-TEXTKERNEL]. Un tel composant peut donc alimenter une plateforme construite sur mesure sans porter lui-même toutes ses règles de recrutement.

Affinda décrit également une sortie structurée concernant l’identité, l’expérience, la formation et les compétences. La page consultée présente des modalités hébergées et auto-hébergées ; il serait donc erroné de supposer que tout parseur commercial impose par nature un transfert vers un service distant [REF-PARSER-AFFINDA]. Ces possibilités restent des offres annoncées par l’éditeur, non des intégrations réalisées ou évaluées dans CAP.

La comparaison économique exige une vigilance particulière. La documentation de facturation Affinda distingue les crédits à la page pour différentes catégories documentaires et les crédits de recrutement calculés par document [REF-AFFINDA-CREDITS]. Un montant générique par page ne peut donc pas être repris comme tarif vérifié du parseur de CV. Le chiffre tiers de 800 dollars pour 6 000 analyses n’est pas retenu comme prix officiel actuel. Ce chapitre ne fournit pas de tableau monétaire artificiellement homogène : les unités, engagements, options et modes d’hébergement devraient d’abord être rapprochés à périmètre comparable.

Le choix d’un parseur spécialisé présente un intérêt lorsque le besoin porte sur un profil détaillé et normalisé, une variété de formats ou une taxonomie partagée. CAP retient plutôt des questions documentaires configurées dans l’offre, avec correction indépendante des champs. Les deux approches peuvent se recouper, notamment lorsque les parseurs acceptent des champs personnalisés. Leur adéquation ne peut être tranchée par une comparaison de listes de fonctionnalités : elle demanderait un corpus représentatif, des annotations et une analyse des erreurs correspondant aux questions réellement utilisées.

### Tableurs et traitements externes : conserver une ouverture

Un tableur est une alternative utile pour filtrer, annoter et appliquer des règles explicites sur un ensemble de lignes. Il ne remplace pas automatiquement les droits contextuels, les transactions et l’immuabilité du dépôt d’une application spécialisée. Son intérêt est plutôt celui d’un espace de travail flexible, particulièrement lorsque les critères doivent être discutés ou calculés sans modifier le logiciel. Cette possibilité n’établit pas que l’organisme utilise actuellement Excel pour recruter.

CAP maintient cette ouverture grâce au CSV. Les RH peuvent exporter les candidatures encore indécises, travailler dans Excel, LibreOffice ou un autre outil, puis proposer des décisions à réimporter. L’export utilise les valeurs effectives et conserve des indications de provenance. Le fichier n’accorde aucun droit supplémentaire sur les documents : ses liens restent soumis à l’authentification [REF-CAP-PRESELECTION].

**Exemple conceptuel.** Une équipe exporte les candidatures d’une offre, filtre les disponibilités dans un tableur et prépare une colonne de décisions. Certaines lignes restent absentes du fichier réimporté. L’assistant de CAP doit les laisser inchangées : l’absence d’une ligne n’est pas un rejet implicite. Les propositions présentes sont contrôlées, regroupées si nécessaire et soumises à confirmation finale. L’exemple décrit un usage permis par le contrat, pas une pratique observée ni une recommandation de critère.

Un outil d’IA externe pourrait également produire des propositions à partir de données exportées, mais cet usage n’est pas un connecteur intégré. Il dépend d’une autorisation propre concernant les données et leur destinataire. L’import n’accorde aucune confiance particulière à son origine : les identités et décisions sont contrôlées de la même manière, qu’elles proviennent d’une saisie humaine, d’une formule ou d’un outil externe. Les autres colonnes ne modifient ni l’identité du candidat ni les corrections d’extraction. La responsabilité de confirmer reste celle des RH.

| Catégorie | Fonction documentée ou usage envisagé | Rapport au périmètre de CAP | Condition de choix |
| --- | --- | --- | --- |
| ATS généraliste | Dossiers, coordination, entretiens, rapports et intégrations | Alternative à une part importante du produit | Étudier configuration, droits, migration et coût complet |
| Parseur spécialisé | Extraction structurée, normalisation, options de formats | Composant documentaire potentiel | Évaluer les champs utiles, erreurs, transferts et contrat |
| Tableur | Filtres et calculs dans un fichier exporté | Complément externe accessible par CSV | Maîtriser copies, fraîcheur et erreurs de manipulation |
| IA externe | Production possible de propositions hors plateforme | Usage conditionnel, non intégration native | Autorisation des données, vérification et confirmation |
| CAP | Parcours borné et règles propres, assistance facultative | Réalisation étudiée dans ce rapport | Assumer maintenance, exploitation et acceptation restante |

## Alternatives techniques et choix retenus

### Un monolithe modulaire plutôt qu’une distribution anticipée

CAP repose sur une API NestJS, un frontend React/Vite, un domaine partagé et PostgreSQL. Pour le périmètre actuel, un monolithe modulaire garde les décisions et leurs effets transactionnels dans un espace cohérent. Une présélection peut ainsi vérifier l’état, fermer le traitement et enregistrer sa notification dans une même transaction, sans protocole de coordination interservices [REF-CAP-ARCHITECTURE].

Des microservices offriraient des déploiements ou des charges autonomes si des besoins d’organisation et d’isolation le justifiaient. Ils introduiraient aussi des échanges réseau, une observabilité distribuée et des choix de cohérence supplémentaires. Aucune mesure de charge n’établit ici cette nécessité. Le monolithe n’est cependant pas automatiquement bien structuré : il demande des frontières métier maintenues et partage ses ressources d’exécution. Le choix est proportionné au prototype, non universel.

### Associer contraintes relationnelles et structures variables

Les offres, candidatures, documents, affectations et corrections possèdent des relations et des identités qui se prêtent à une base relationnelle. Les formulaires, instantanés et résultats variables se prêtent à des structures JSONB validées. PostgreSQL documente la coexistence des approches relationnelle et JSON, tout en recommandant une structure prévisible des documents et une attention à leur granularité de mise à jour [REF-TECH-POSTGRES-JSON].

Une modélisation entièrement relationnelle rendrait chaque variante plus explicite, au prix de tables et migrations supplémentaires. Une base documentaire privilégierait la souplesse des agrégats, mais ne supprimerait pas les relations et contrôles métier à maintenir. Le compromis de CAP n’est donc pas « sans schéma » : les structures dynamiques restent contraintes par validation à l’exécution. Les détails des clés et des instantanés seront développés dans la conception.

### Préférer des sorties bornées et une lecture native

La sortie structurée est retenue plutôt qu’un résumé libre pour les questions configurées. Elle permet une correction champ par champ et des colonnes d’export interprétables. Le texte libre garde un intérêt pour une synthèse exploratoire, mais impose davantage de lecture et de normalisation avant comparaison. Un classement demanderait, lui, une définition explicite des critères et une évaluation propre ; il ne découle pas automatiquement d’une extraction valide.

Pour les PDF, CAP exploite la couche texte par un lecteur natif local avant l’interprétation distante éventuelle. La documentation du projet pypdf illustre les difficultés générales du format : ordre de lecture, texte positionné, tableaux et distinction entre PDF numérique et scan [REF-TECH-PDF-TEXTE]. Elle éclaire le problème documentaire, sans identifier la bibliothèque utilisée par CAP, qui possède son propre lecteur natif décrit dans le contrat [REF-CAP-TRAITEMENT].

L’OCR aurait un intérêt pour les scans ; la vision pourrait exploiter certaines structures visuelles. Ces options ajoutent un calcul et leurs erreurs propres. Le chemin livré ne les utilise pas comme secours silencieux. Une lecture inutilisable devient un échec explicite, non une réponse affirmant que le CV ne mentionne rien. Ce choix borne la couverture documentaire ; aucun avantage chiffré de coût, de latence ou de précision n’en est déduit.

| Arbitrage | Choix de CAP | Alternative pertinente | Compromis principal |
| --- | --- | --- | --- |
| Organisation de l’API | Monolithe modulaire | Services distribués | Transactions locales contre autonomie de déploiement |
| Données variables | Relationnel et JSONB validé | Tout relationnel ou documentaire | Souplesse contrôlée contre complexité de validation |
| Interprétation | Questions et sorties structurées | Résumé libre ou profil normalisé | Comparabilité des champs contre richesse expressive |
| Lecture du PDF | Texte natif local | OCR ou vision | Couverture bornée et erreurs explicitables |
| Exécution | Traitement asynchrone | Analyse dans la requête HTTP | Dépôt indépendant contre gestion d’états supplémentaires |
| Échange externe | CSV inspectable et import confirmé | Connecteurs étroits | Faible couplage contre manipulations et fraîcheur limitée |

## Synthèse et traçabilité

Les choix précédents répondent à un même principe : automatiser des opérations délimitées sans supprimer la responsabilité de l’acteur qui décide. Le CSV ne contourne pas les autorisations ; l’extraction ne décide pas du recrutement ; la revue n’est pas une approbation ; une proposition n’est pas une embauche. Ces séparations ne constituent pas une complexité gratuite. Elles évitent qu’un état technique soit interprété comme un fait métier différent.

| Besoin prioritaire | Choix correspondant | Élément livré décrit par les contrats | Preuve à rechercher pour l’acceptation |
| --- | --- | --- | --- |
| Recruter sans assistance | Zéro tâche valide | Dépôt et décisions manuelles | Parcours authentifié sans fournisseur |
| Partager le travail sans écrasement | Contrôle de révision ciblé | Conflit et brouillon local conservé | Scénarios concurrents et réapplication manuelle |
| Comprendre l’information utilisée | Source, original et correction distincts | Revue et export des valeurs effectives | Cohérence des projections et des exports réels |
| Décider sans dépendance artificielle | Présélection indépendante | Commandes individuelles et import | Clôtures, refus tardifs et absence de faux achèvement |
| Échanger avec des outils courants | Contrat CSV borné | Aperçu puis confirmation atomique | Identités, doublons, conflits et rollback |
| Limiter les effets automatiques | Proposition et embauche explicites | Prérequis et autorité du propriétaire | Chemins sans entretien et avec tous les entretiens requis |

La grille ne prouve pas à elle seule la conformité de la réalisation. Elle prépare le lien entre les besoins, les mécanismes détaillés dans les chapitres suivants et les preuves discutées ensuite. La présence d’un humain dans le parcours n’établit pas non plus une qualification juridique particulière du système : celle-ci dépendrait du contexte applicable, des finalités et des usages effectifs, à analyser séparément.

## Conclusion

L’étude des besoins positionne CAP comme une plateforme de recrutement bornée, ouverte au travail manuel et aux outils externes, avec une assistance documentaire facultative. Les ATS existants démontrent que la centralisation, les entretiens et les intégrations sont des fonctions déjà établies ; les parseurs spécialisés offrent des composants crédibles, parfois configurables ou auto-hébergés. Le choix de CAP n’est donc pas justifié par une supériorité présumée, mais par la maîtrise d’un ensemble précis de règles et par l’objectif de les concevoir explicitement. La conception peut maintenant traduire ces besoins en états, données, autorisations et invariants, tout en conservant une frontière nette entre implémentation et acceptation.
