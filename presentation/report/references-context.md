# Références de contexte, besoins et solutions existantes

Registre pour les chapitres 1 et 2. Consultation documentaire : **13 novembre 2026**. Les identifiants `[REF-*]` sont destinés à l’assemblage bibliographique. Les sources commerciales établissent ce que l’éditeur documente, non une performance indépendante. Les références internes décrivent les règles du dépôt ; le statut daté précise leur vérification.

## Sources internes

| Identifiant | Titre | URL ou chemin dans le dépôt | Affirmation précisément soutenue |
| --- | --- | --- | --- |
| REF-CAP-PRODUIT | Product and current boundaries | `docs/current/product.md` | Une entreprise par déploiement ; périmètre et rôles ; dépôts immuables ; absence de classement et décision autonomes. |
| REF-CAP-PARCOURS | Implemented workflows and vocabulary | `docs/current/workflows.md` | Traitement, revue et recrutement indépendants ; plans facultatifs ; présélection explicite ; proposition propriétaire et embauche séparée. |
| REF-CAP-TRAITEMENT | CV extraction, shared HR review and export — source contract | `docs/current/contracts/processing-review-api.md` | Version actuelle au 13 novembre : questions documentaires, date figée, traitement après dépôt, lecture native, caches, tentatives durables et corrections indépendantes. Prévaut sur les indications anciennes de la carte d’architecture concernant poller/cache. |
| REF-CAP-PRESELECTION | Screening export/import and shared decisions | `docs/current/contracts/screening-api.md` | Décisions RH sur dossiers indécis sans gate de revue ; premier commit prévalent ; CSV et identité gelée ; contrôle, regroupement et confirmation atomique ; notices génériques. Pour la forme actuelle des nouvelles valeurs CV, compléter par le contrat traitement/revue. |
| REF-CAP-ARCHITECTURE | Current responsibility and persistence map | `docs/current/architecture.md` | Monorepo, API NestJS, React/Vite, PostgreSQL, relations/JSONB, frontières d’adaptateurs et autorité contextualisée. Les passages anciens sur absence de poller/cache et migrations non appliquées ne sont pas repris. |
| REF-CAP-INTERFACE | Frontend design — durable UI baseline | `docs/current/guides/frontend-design.md` | Inspection distincte d’édition, actions contextuelles, source PDF et corrections par champ, entrée candidat contrôlée, confirmations et conflits explicites. |
| REF-CAP-DECISIONS | Requested product changes and decisions | `docs/plan/product-decisions.md` | Origine documentaire des arbitrages et directions retenues, notamment abandon du gate de revue et maintien des décisions explicites. Le document de plan ne prouve pas à lui seul une livraison. |
| REF-CAP-DEMARCHE | Documentation index et Task board | `docs/README.md` ; `docs/plan/tasks.md` | Séparation documents courants/plans/journal et suivi par checkpoints ; gates d’acceptation distinctes des fonctionnalités sources. |
| REF-CAP-JOURNAL | Significant checkpoints — report-support notes | `docs/journal.md` | Sélection datée d’itérations et limites de preuve ; entrée du 13 novembre concernant lancement, fixtures et travailleur réel. Aucun calendrier Scrum ou durée totale déduit. |
| REF-CAP-STATUT | Verification status | `docs/current/status.md` | Source de consultation pour la portée datée des contrôles et les gates ouvertes, sans revendication de régression complète ni addition des tests historiques. |

## Sources externes officielles consultées

### REF-ATS-GREENHOUSE

- **Auteur institutionnel :** Greenhouse.
- **Titre :** *What is an applicant tracking system (ATS)?*
- **URL :** https://www.greenhouse.com/resources/glossary/what-is-an-applicant-tracking-system-ats
- **Consultation :** 13 novembre 2026.
- **Nature :** glossaire métier d’un éditeur commercial ; page affichant le 22 avril 2026.
- **Soutient précisément :** un ATS rassemble candidatures, données candidat et étapes ; la page décrit revue, retours d’entretien, rapports, intégrations et enjeux de gouvernance/déploiement.
- **Ne soutient pas :** gain local de productivité, précision, équité ou supériorité de CAP ; bénéfices marketing et chiffres promotionnels non repris.

### REF-ATS-WORKABLE

- **Auteur institutionnel :** Workable.
- **Titre :** *Workable features | Complete HR and hiring platform*.
- **URL :** https://www.workable.com/features
- **Consultation :** 13 novembre 2026.
- **Nature :** catalogue fonctionnel commercial.
- **Soutient précisément :** annonce de fonctions ATS, outils d’entretien, permissions, intégrations calendrier, résumés/scores IA, API développeur, exports Excel/CSV/PDF et fonctions de gestion des salariés.
- **Ne soutient pas :** présence de toutes les fonctions dans toute formule, qualité réelle, conformité juridique de l’utilisateur ou inadaptation à BeeCoders. Les chiffres de volume et de performance ne sont pas repris.

### REF-PARSER-TEXTKERNEL

- **Auteur institutionnel :** Textkernel.
- **Titre :** *Resume and job parsing software — Parser*.
- **URL :** https://www.textkernel.com/products-solutions/parser/
- **Consultation :** 13 novembre 2026.
- **Nature :** fiche produit et FAQ officielles.
- **Soutient précisément :** extraction, classification et normalisation des données de CV/offres ; API REST à sortie JSON ; prise en charge de formats variés ; OCR et champs personnalisés FlexRequests documentés. La page distingue moteur, options et offres.
- **Ne soutient pas :** benchmark de CAP ; coûts par analyse calculés sans vérifier la consommation des crédits/options ; promesses de rapidité, précision ou réduction des biais non reprises.

### REF-PARSER-AFFINDA

- **Auteur institutionnel :** Affinda.
- **Titre :** *Upgrade to a resume parser built for speed and scored for accuracy*.
- **URL :** https://www.affinda.com/resume-parser
- **Consultation :** 13 novembre 2026.
- **Nature :** page produit commerciale officielle.
- **Soutient précisément :** sortie structurée sur identité, expérience, formation et compétences ; présentation d’options hébergée et auto-hébergée exposant une API de même forme. Il est donc injustifié d’assimiler tout parseur commercial à un transfert distant obligatoire.
- **Ne soutient pas :** prix générique à la page appliqué au CV, résultats comparatifs indépendants ou intégration de ce produit dans CAP. Les mesures et comparaisons marketing ne sont pas utilisées.

### REF-AFFINDA-CREDITS

- **Auteur institutionnel :** Affinda.
- **Titre :** *Billing, credits, and payment options*.
- **URL :** https://docs.affinda.com/billing
- **Consultation :** 13 novembre 2026.
- **Nature :** documentation officielle de facturation.
- **Soutient précisément :** distinction explicite entre Page Credits pour différentes catégories et Resume Parsing Credits calculés par document pour les produits de recrutement, notamment Resume Parsing, Job Description et Candidate Search & Match.
- **Correction éditoriale :** le tarif générique de 0,20 dollar/page n’est pas un tarif vérifié du parseur de CV ; l’estimation tierce de 800 dollars/6 000 analyses n’est pas reprise comme prix officiel actuel. Aucun montant comparatif n’est nécessaire aux chapitres 1–2.

### REF-TECH-POSTGRES-JSON

- **Auteur institutionnel :** PostgreSQL Global Development Group.
- **Titre :** *PostgreSQL Documentation — 8.14. JSON Types*, particulièrement *Designing JSON Documents*.
- **URL :** https://www.postgresql.org/docs/current/datatype-json.html
- **Consultation :** 13 novembre 2026 ; lien `current` présentant PostgreSQL 18 lors de la consultation, sans déduire la version déployée de CAP.
- **Nature :** documentation technique officielle.
- **Soutient précisément :** coexistence du relationnel et de JSON ; structure prévisible recommandée ; possibilité d’indexation JSONB ; verrouillage de la ligne entière lors des mises à jour et attention à la taille/granularité.
- **Ne soutient pas :** schéma propre à CAP, index effectivement installés, benchmark ou passage à PostgreSQL 18.

### REF-TECH-PDF-TEXTE

- **Auteur institutionnel :** projet pypdf.
- **Titre :** *Extract Text from a PDF*.
- **URL :** https://pypdf.readthedocs.io/en/stable/user/extract-text.html
- **Consultation :** 13 novembre 2026.
- **Nature :** documentation technique officielle du projet.
- **Soutient précisément :** difficultés générales d’extraction dues au positionnement du texte, à l’ordre de lecture et aux tableaux ; différence entre PDF numérique, scan et document déjà OCRisé ; un lecteur de texte n’est pas un moteur OCR.
- **Ne soutient pas :** bibliothèque effectivement utilisée par CAP, performance du lecteur intégré ou échec universel de la couche texte. CAP utilise son lecteur natif décrit dans son contrat, et non pypdf.

## Informations restant à confirmer

- Contexte : commanditaire opérationnel exact, interlocuteurs effectivement consultés, organisation et pratiques de BeeCoders. Aucune histoire, statistique RH, durée de stage ou enquête n’est inventée.
- Désignation : expansion CAP proposée ; métadonnées institutionnelles et nom final à valider.
- Étude d’adoption : pas de devis comparable, de test concurrent ni d’audit des conditions contractuelles ; aucun classement économique des solutions.
- Acceptation : les contrats de source ne remplacent pas les vérifications authentifiées, de confidentialité, de concurrence et d’usage manuel.
- Droit : aucun statut réglementaire de CAP n’est déduit de la seule présence d’un humain ; aucune conformité auditée n’est affirmée.

Recherche écartée : l’URL générique `https://www.lever.co/platform/` a renvoyé 404 lors de la consultation. Aucun fait produit relatif à Lever n’a donc été ajouté à partir de cette adresse. Les sources tierces et les tarifs génériques erronément attribués au parsing de CV dans un plan antérieur ne sont pas repris.
