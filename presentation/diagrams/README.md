# Diagrammes de présentation

Vues conceptuelles de comportements **implémentés dans les sources**, soumises à
relecture ; ni preuve de validation fonctionnelle, ni résultats de qualité IA.
Les identifiants DIA-02/03/04 sont conservés pour les références existantes.
Les six vues sont intégrées au PDF courant de 40 pages : pages 14–16, 18, 21 et 22.

## Choix de la vue

| Fichier (sans extension) | Usage et périmètre |
| --- | --- |
| `DIA-02-use-cases` | Réutilisé sans changement : acteurs, frontière du système et intentions ; UML en DOT uniquement. Pas une matrice exhaustive d’autorisations. |
| `DIA-03-classes` | Réutilisé et actualisé : entités et associations sélectionnées, pas toutes les tables. Une tâche porte plusieurs corrections possibles, **au plus une par question** pour cette candidature ; pas un historique de corrections. |
| `DIA-04-architecture` | Réutilisé et actualisé : React/Vite, API NestJS, persistance privée, mail et traitement asynchrone dans l’API. PDF natif, caches privés locaux et accès Jev via JevGateway sont implémentés, non une extension future PDF/DOCX. PostgreSQL et documents locaux sont regroupés visuellement, pas confondus en une seule technologie. |
| `DIA-05-processing` | Nouvelle vue du chemin de succès : PDF privé → Markdown natif → requête multi-question via JevGateway → résultat brut et champs typés → revue RH / corrections facultatives → valeurs effectives. Cinq familles de questions : formation, certification, expérience, décompte de couverture et preuve individuelle de compétence ; **pas cinq jobs/appels**. Les caches locaux sont une annotation séparée, sans flèches ; DIA-07 détaille le choix original/correction. Aucune décision automatique de recrutement. |
| `DIA-06-lifecycle` | Nouvelle vue de sélection : rejet/présélection RH, premier entretien planifié, tous les entretiens configurés Pass ou plan vide, Proposition explicite par le propriétaire, puis Embauche séparée (noms internes : `offer` / `hired`, Offer / Hired). Un Fail déclenche automatiquement l’état terminal non retenu et annule les autres entretiens non terminés ; aucune décision d’embauche n’est automatique. Vue non exhaustive : les rejets manuels ultérieurs restent possibles ; leur autorité dépend du stade. |
| `DIA-07-review` | Nouvelle vue de filiation d’un champ : PDF et résultat original conservés, correction distincte avec auteur/date, puis champ effectif utilisé en revue/export. Correction présente prioritaire, sinon original ; une correction `null` signifie inconnu revu et ne déclenche pas un retour à l’original. Pas un journal d’audit complet. |

Choisir **DIA-04 pour les responsabilités**, **DIA-05 pour le traitement**,
**DIA-06 pour les décisions humaines** et **DIA-07 pour la traçabilité** : ne pas
empiler ces quatre explications sur une même diapositive. Les mises en page DOT
privilégient des rangées compactes pour une zone de **12 × 3,5 pouces** en 16:9 ;
les versions Mermaid conservent la sémantique, pas les positions Graphviz.

## Sources faisant autorité

- [Architecture](../../docs/current/architecture.md) : responsabilités, ports et
  persistance. Ses anciens paragraphes « pas de poller/cache » ne décrivent pas
  le traitement CV plus récent ; pour ce périmètre, utiliser le contrat suivant.
- [Contrat traitement/revue](../../docs/current/contracts/processing-review-api.md),
  sections définition, traitement global, résultats immuables, corrections et
  exports : PDF natif disponible, caches privés fichier, worker dans l’API,
  requête groupée et correction `(candidature, tâche, question)`.
- [Workflows](../../docs/current/workflows.md) et
  [transitions](../../docs/current/guides/transition-map.md), section recrutement :
  règles de présélection, entretiens, Offer/Hired et états terminaux. Les anciennes
  indications d’exécution fixture uniquement dans la carte de transitions ne
  remplacent pas le contrat de traitement récent.

Le traitement, la revue et le recrutement sont des dimensions indépendantes :
la sélection peut intervenir sans attendre la revue. Terminer la revue ne
présélectionne pas. Les diagrammes omettent volontairement gardes de révision,
conditions détaillées de préparation, échecs d’extraction, reprises, budgets et
protocole de clé. Les valeurs indisponibles ne sont pas des faux/zéros inventés.
Modes fixture/offline et Jev réel restent distincts ; l’architecture montre la
capacité implémentée, **pas une activation générale ni une validation réelle**.
Les réglages restent désactivés par défaut ; toute exécution réelle requiert son
consentement et ses garde-fous. Aucune donnée, clé ou réponse réelle n’est incluse.

## Édition et rendu

- Pour DIA-03/04, modifier **`models.mjs`** ; le script régénère leurs DOT/Mermaid.
  Les rangs compacts DOT sont définis dans `scripts/render-diagrams.mjs`.
- Pour DIA-05/06/07, modifier directement les **deux** sources `.dot` et `.mmd`
  en conservant leur sémantique commune. DIA-02 reste édité directement en DOT :
  Mermaid n’a pas de diagramme UML de cas d’utilisation natif.
- Rendre les six SVG :
  `pnpm --filter @recruitment/presentation diagram:render`.

Réutilisation de **`@viz-js/viz` (Graphviz/WASM) déjà installé**, sans nouvelle
dépendance, navigateur ni Graphviz global. Les SVG sont écrits uniquement dans
`presentation/dist/diagrams/` (ignoré) et réutilisables par l’assemblage Typst
existant. `pdf:build` reconstruit aussi le PDF partagé `exports/status.pdf`.
Le rendu Graphviz et la syntaxe Mermaid ont été vérifiés ; cela ne vaut ni test
applicatif ni relecture visuelle finale. L’utilisateur assure cette dernière ;
aucune nouvelle rasterisation de pages n’est souhaitée.
