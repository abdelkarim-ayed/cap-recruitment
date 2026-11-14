# Chapitre 2 — Analyse des besoins et étude des solutions

## Introduction

L’analyse des besoins relie les activités du recrutement aux fonctions attendues de la plateforme. Elle précise les responsabilités des intervenants, les informations nécessaires à leur travail et les exigences transversales. L’étude des solutions existantes permet ensuite de situer CAP parmi les ATS, les parseurs documentaires et les outils de travail externes.

## Acteurs et responsabilités

Quatre catégories d’acteurs interviennent dans le parcours. Le candidat dépose son dossier et consulte sa progression. Les recruteurs et administrateurs assurent le travail RH partagé. Le propriétaire est le membre RH responsable d’une offre donnée. L’interviewer réalise l’évaluation du rendez-vous qui lui est affecté. La propriété et l’affectation sont donc des relations à une ressource, et non des rôles généraux supplémentaires.

[[TABLE:ch2-acteurs]] Acteurs et responsabilités

| Acteur ou responsabilité | Fonctions principales | Conditions d’intervention |
| --- | --- | --- |
| Candidat | Déposer et consulter sa candidature | Identité vérifiée ; accès à son propre dossier ; une candidature par offre |
| Recruteur ou administrateur | Créer une offre, consulter les dossiers, revoir les résultats, présélectionner et planifier | Accès RH ; actions compatibles avec l’état du dossier |
| Propriétaire de l’offre | Modifier le brouillon, publier, fermer les dépôts, enregistrer proposition et embauche | Propriété de l’offre et prérequis du parcours |
| Interviewer affecté | Consulter le contexte autorisé et soumettre son évaluation finale | Affectation au rendez-vous ; évaluation à partir de l’horaire prévu |

Le rôle administrateur ne remplace pas la propriété d’une offre. Un membre RH peut aussi être affecté à un entretien ; sa capacité à l’évaluer découle alors de cette affectation. Ces distinctions permettent d’exprimer les autorisations à partir de l’acteur et de la situation courante.

La [[REF:DIA-02]] rassemble les principaux cas d’utilisation et les intervenants concernés.

[[FIG:DIA-02]]

Le travail RH est partagé : consulter une candidature ne la réserve pas. L’équipe organise la répartition des dossiers et la discussion des critères ; la plateforme contrôle l’enregistrement des modifications et des décisions. Lors de décisions de présélection concurrentes, la première décision validée est conservée et les suivantes sont refusées. Cette règle résout le conflit d’écriture, sans arbitrer la pertinence des appréciations.

## Besoins fonctionnels

### Préparer et publier une offre

Le propriétaire définit l’annonce, les réponses et documents attendus, les éventuelles questions d’extraction ainsi que le plan d’entretien. Il doit pouvoir examiner la configuration enregistrée avant de publier. Une offre peut ne comporter ni extraction ni entretien : ces étapes répondent au besoin du poste et ne sont pas imposées artificiellement.

La publication stabilise la configuration qui servira à interpréter les candidatures. La fermeture arrête ensuite les nouveaux dépôts tout en permettant de poursuivre les dossiers déjà reçus.

### Déposer et consulter une candidature

Le candidat authentifié remplit le formulaire et transmet les pièces demandées. La réception du dossier doit être indépendante de l’analyse documentaire : une interruption du service d’assistance ne remet pas en cause le dépôt. Le contenu soumis est ensuite conservé afin que les personnes chargées du recrutement examinent les mêmes déclarations et documents.

Le candidat doit retrouver sa candidature, même après la fermeture de l’offre, et distinguer un dépôt déjà effectué d’un nouveau formulaire. Sa consultation présente une progression adaptée sans révéler les notes internes, les corrections RH ou les évaluations d’entretien.

### Examiner les informations documentaires

Le dossier RH rassemble les réponses, les pièces et les résultats de l’assistance. La revue permet de consulter le document source et de corriger des champs déterminés. Les questions couvrent la formation, une certification déclarée, l’expérience, la couverture d’une liste de compétences et des indices documentaires relatifs à une compétence.

Ces éléments soutiennent la lecture initiale du dossier. Ils ne remplacent pas l’appréciation professionnelle et une information indisponible doit rester distincte d’une réponse négative. La revue constitue un contrôle disponible ; la décision de l’utiliser dépend du dossier et de l’organisation du travail.

### Décider et organiser les entretiens

La présélection est une décision initiale de poursuite du parcours, distincte d’une évaluation finale des compétences. Les ressources humaines peuvent présélectionner ou rejeter une candidature encore indécise sans attendre l’achèvement du traitement documentaire ou de la revue. Les interactions entre ces décisions et les écritures encore ouvertes sont détaillées au [[REF:chapter-3]].

Les entretiens prévus sont planifiés puis affectés à un responsable. Celui-ci enregistre ses observations et une issue finale « Pass » ou « Fail ». Dans le parcours retenu, un « Fail » constitue une appréciation éliminatoire : il termine la candidature et annule les autres entretiens inachevés. Il s’agit d’une règle déclenchée par l’évaluation humaine, et non d’un rejet issu de l’extraction.

Après la réussite de tous les entretiens requis, ou directement après présélection si le plan est vide, le propriétaire peut enregistrer une **proposition**. L’**embauche** fait l’objet d’une action ultérieure. Dans ce rapport, « offre » désigne le poste publié et « proposition » l’étape de recrutement correspondant à *Offer*.

### Échanger des décisions par CSV

Les ressources humaines doivent pouvoir exporter les informations utiles au travail externe, puis proposer des décisions de présélection ou de rejet à réimporter. L’import vérifie les identités, présente les propositions et demande une confirmation avant application. Les lignes absentes restent inchangées ; les autres colonnes du fichier ne deviennent pas des corrections documentaires.

Cette ouverture permet l’usage de tableurs ou de traitements externes sans leur déléguer directement l’écriture dans la plateforme. Les liens documentaires exportés restent soumis aux droits d’accès.

## Exigences non fonctionnelles

Les exigences transversales portent sur la protection des dossiers, la cohérence du travail partagé et la continuité du parcours manuel.

[[TABLE:ch2-exigences]] Exigences non fonctionnelles

| Exigence | Comportement attendu | Incidence sur la solution |
| --- | --- | --- |
| Confidentialité | Limiter les données retournées et les téléchargements au contexte autorisé | Contrôles serveur et vues adaptées aux acteurs |
| Intégrité | Conserver le contenu soumis et la provenance des informations utilisées | Données et résultats distincts, contexte de dépôt stable |
| Cohérence concurrente | Refuser les écritures obsolètes sans écrasement silencieux | Transactions, révisions et résolution explicite des conflits |
| Disponibilité fonctionnelle | Recevoir les candidatures et permettre les décisions sans assistance | Traitement différé et états d’échec lisibles |
| Maîtrise des appels externes | Encadrer l’admission, les dépenses et la reprise après incertitude | Point d’accès fournisseur contrôlé et suivi des tentatives |
| Utilisabilité | Distinguer consultation, édition et confirmation d’une décision | Navigation contextuelle et retours d’erreur exploitables |
| Maintenabilité | Faire évoluer les adaptateurs sans disperser les règles métier | Modules, contrats partagés et frontières d’intégration |

La confidentialité s’applique aussi aux exports et aux copies de documents. La préparation d’une exploitation réelle demande de définir les destinataires, la conservation et les obligations applicables au traitement des candidatures.

## Étude des solutions existantes

### ATS généralistes

Les *Applicant Tracking Systems* centralisent les candidatures et le suivi du recrutement. Greenhouse décrit notamment la collecte des dossiers, les étapes, les retours d’entretien, les rapports et les intégrations [REF-ATS-GREENHOUSE]. Workable présente une suite associant recrutement, entretiens, permissions, intégrations de calendrier et fonctions RH ; son catalogue comprend également des fonctions assistées par IA, des exports et une API [REF-ATS-WORKABLE].

Ces offres constituent une alternative crédible au développement spécifique. Elles apportent des fonctions courantes déjà intégrées, tandis que leur adoption demande d’étudier la configuration, les droits, l’hébergement, la migration et le contrat de service. CAP privilégie la maîtrise d’un parcours et de règles propres, en contrepartie d’un effort de réalisation, de maintenance et de validation. La comparaison porte ici sur l’adéquation fonctionnelle, sans conclure à une supériorité commerciale ou à l’inadaptation d’un ATS à BeeCoders.

### Parseurs de CV spécialisés

Un parseur transforme les documents en données structurées destinées à un système plus large. Textkernel documente l’extraction, la classification et la normalisation des données de CV et d’offres, avec une API JSON, différents formats d’entrée et des options comme l’OCR ou les champs personnalisés FlexRequests [REF-PARSER-TEXTKERNEL]. Affinda présente également des données d’identité, d’expérience, de formation et de compétences, ainsi que des modalités hébergées et auto-hébergées [REF-PARSER-AFFINDA].

Ces composants sont pertinents pour obtenir un profil détaillé et normalisé. CAP cible plutôt un ensemble limité de questions configurées pour le poste, dont les réponses sont directement utilisables dans la revue par champ. Les deux approches peuvent se recouper lorsque le parseur propose des champs personnalisés. Leur choix dépend donc de la précision du besoin, des formats, de la personnalisation et des conditions d’intégration.

Les unités économiques doivent également être rapprochées : la documentation Affinda distingue notamment les crédits par page et les crédits de recrutement par document [REF-AFFINDA-CREDITS]. Un tarif par page ou par document ne se compare pas directement à une facturation par tokens sans hypothèses sur les entrées et les services inclus.

### Tableurs et traitements externes

Les tableurs offrent un environnement souple de filtrage, d’annotation et de calcul. Ils complètent un dossier centralisé, mais introduisent des copies dont la fraîcheur et la diffusion doivent être maîtrisées. L’export CSV de CAP permet ce travail externe, tandis que l’import ramène les décisions dans un circuit de contrôle et de confirmation.

Un outil d’IA externe peut également être utilisé sur un export lorsque le destinataire et les données transférées sont autorisés. Il ne constitue pas un connecteur natif de CAP. Quel que soit l’outil employé, la vérification des propositions et leur confirmation restent nécessaires.

### Synthèse comparative

Le tableau suivant s’appuie sur les fonctions documentées par les éditeurs et sur les besoins retenus. Il s’agit d’une analyse de conception, non d’un benchmark des produits.

[[TABLE:ch2-solutions]] Catégories de solutions étudiées

| Catégorie | Apport principal | Critères de choix | Position par rapport à CAP |
| --- | --- | --- | --- |
| ATS généraliste | Parcours, dossiers et coordination intégrés | Configuration, permissions, intégrations, hébergement et coût de service | Alternative à une grande partie de la plateforme |
| Parseur spécialisé | Profil documentaire structuré et normalisé | Formats, champs personnalisés, sortie, revue et mode d’hébergement | Composant documentaire possible |
| Tableur | Filtres, annotations et calculs libres | Qualité du fichier, fraîcheur, diffusion et contrôle du retour | Complément pris en charge par CSV |
| Service de questions structurées | Réponses à des critères documentaires configurés | Contrat typé, formulation des questions, intégration et unité de coût | Approche retenue pour l’assistance |
| Développement spécifique CAP | Règles et interface adaptées au périmètre | Effort de maintenance, exploitation et vérification | Solution réalisée dans le projet |

## Choix de solution

Les besoins orientent la réalisation vers les choix suivants. Chaque choix répond à une priorité du périmètre et comporte une contrepartie.

[[TABLE:ch2-choix]] Choix techniques et contreparties

| Besoin | Choix retenu | Contrepartie |
| --- | --- | --- |
| Coordonner les décisions et leurs écritures | Monolithe modulaire NestJS, avec transactions dans une même API | Déploiement simple, mais frontières entre modules à maintenir et évolution de l’API couplée |
| Relier les dossiers tout en configurant formulaires et résultats | PostgreSQL relationnel et JSONB pour les structures variables | Contraintes relationnelles pour les identités ; validation explicite et évolution des schémas JSON nécessaires |
| Aligner interface, API et valeurs échangées | TypeScript et schémas Zod partagés | Moins de divergence entre contrats, sans remplacer les contrôles serveur d’autorisation et de concurrence |
| Préparer le document sans service de conversion distant | Lecture PDF native locale vers Markdown | Maîtrise de la préparation, mais dépendance à la couche texte et limites sur les mises en page complexes |
| Produire des indicateurs corrigibles et exportables | Questions typées Jev, regroupées par extracteur | Réponses structurées, mais qualité dépendante du document et des formulations ; coût et disponibilité du fournisseur à encadrer |

Les chapitres de conception et d’architecture détaillent ces choix et leurs frontières.

Pour l’assistance, les réponses structurées sont préférées à un résumé libre afin de faciliter la correction par champ et l’export. Le texte du PDF est préparé localement avant l’interprétation distante éventuelle. La couche texte ne couvre pas tous les documents : les scans nécessitent un traitement différent et l’ordre de lecture peut poser difficulté [REF-TECH-PDF-TEXTE]. Le recours à l’OCR constitue ainsi une extension de couverture, et non une fonction implicite du lecteur.

Le choix retenu associe donc un parcours manuel complet, une assistance facultative et un échange CSV inspectable. Il répond aux priorités de configurabilité, de maîtrise des informations et d’intégration ; la mise en œuvre documentaire est développée au [[REF:chapter-5]].

## Conclusion

L’analyse établit les responsabilités de chaque acteur et les exigences de confidentialité, de cohérence et de continuité du parcours. L’étude des solutions situe CAP parmi des alternatives établies : les ATS organisent le recrutement, les parseurs structurent les profils et les outils externes apportent une souplesse de traitement. La réalisation spécifique retient un ensemble ciblé de fonctions et de règles, que le chapitre suivant traduit en modèle métier et en données.
