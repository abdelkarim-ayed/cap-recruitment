# Assemblage du rapport

Outils statiques, sans dépendance Node supplémentaire ni appel réseau. Le script ne compile pas le PDF et ne lance ni application, ni navigateur. Aucun chapitre n’est généré ou complété automatiquement.

## Commandes finales

Depuis `presentation/` :

```sh
node report/scripts/assemble.mjs
node scripts/typst.mjs compile report/pdf/main.typ exports/report.pdf --root .
```

Pour une **préversion explicitement incomplète**, remplacer la première commande par :

```sh
node report/scripts/assemble.mjs --partial
```

Un assemblage normal refuse les neuf fichiers de chapitre absents ou vides. `--partial` ajoute un avertissement dans le PDF, même lorsque tous les fichiers existent. La présence d’un fichier ne prouve pas sa complétude éditoriale. Les fichiers bibliographiques absents et les citations non résolues produisent des avertissements, non une erreur bloquante.

Le wrapper emploie le compilateur local `.local/tools/typst-0.15.1/typst` (à la racine du dépôt), puis `typst` du PATH en repli ; `TYPST_BIN` permet un chemin explicite. Aucun téléchargement n’est effectué par ces scripts. Typst doit avoir accès à une police Serif et Mono ; Libertinus/DejaVu sont privilégiées.

## Entrées et sorties

Les neuf fichiers requis sous `report/chapters/` sont :

1. `00-introduction.md`
2. `01-cadre-objectifs-demarche.md`
3. `02-besoins-solutions-existantes.md`
4. `03-conception-metier-donnees-garanties.md`
5. `04-architecture-realisation.md`
6. `05-assistance-documentaire-supervision.md`
7. `06-verification-demonstration-discussion.md`
8. `07-conclusion-perspectives.md`
9. `08-resume-mots-cles-glossaire.md`

Le fichier `08-resume-mots-cles-glossaire.md` est un **préliminaire** : il apparaît après les deux couvertures vides, avant la table des matières. Seuls les fichiers 00–07 composent le corps. Le JSON sépare explicitement `frontmatter` et `chapters` (schéma 2).

La bibliographie combine `report/references-context.md`, `report/references-architecture.md` et `report/references-extraction.md`, dans cet ordre. Les registres Markdown restent inchangés. Le PDF en extrait des entrées concises avec clé, auteur, titre, URL/chemin et date de consultation lorsque ces champs existent. Les assertions soutenues/non soutenues, instructions de revue et notes de contexte restent dans les registres, hors de la bibliographie PDF. Aucun auteur ou renseignement manquant n’est inventé.

Les définitions sont reconnues structurellement : clé `REF-CLE` (nue ou entre crochets) au début d’un titre, ou dans la première cellule d’une ligne de tableau bibliographique. La première définition fournit la cible interne ; une simple citation dans un paragraphe ne crée pas de définition. Le motif documentaire `[REF-*]` n’est jamais enregistré comme clé. Les tableaux de registre sont transformés en entrées lisibles et ne figurent pas dans la liste des tableaux du rapport. Les formats non reconnus conservent un repli en texte structuré avec avertissement, plutôt que de perdre silencieusement une source.

Sorties déterministes (pas d’horodatage) dans le répertoire ignoré `dist/report/` :

- `report.json` : arbre de contenu, état partiel, clés bibliographiques et avertissements ;
- `figures.json` : chaque occurrence de figure, source/ligne, titre, chemin stable et disponibilité.

L’assemblage vérifie les chemins des images, pas leur validité graphique. Il faut relancer l’assemblage lorsqu’un visuel est ajouté : sa disponibilité est figée dans le JSON. Aucun fichier n’est copié hors de `presentation/`.

## Markdown pris en charge

- Titres ATX `#`, `##`, `###` (également niveaux 4–6), paragraphes, gras, italique, code inline, liens usuels, autoliens et URL HTTP(S) nues.
- Listes à puces/numérotées, indentation simple, citations `>`, séparateurs, blocs de code clôturés.
- Tableaux à séparateurs `|` : retour à la ligne dans les cellules, colonnes de même largeur, alignements Markdown, en-tête répété si le tableau se prolonge. `\|` fonctionne dans les cellules. Une légende est dérivée des en-têtes pour alimenter la liste des tableaux.
- Citations `[REF-CLE]` ou `[[REF-CLE]]`, reliées à la bibliographie si la clé existe.
- Images locales autonomes `![Légende](chemin.svg)`, relatives au fichier Markdown et limitées à la racine `presentation/`. Les images distantes ne sont jamais téléchargées. Les liens HTTP(S)/mailto sont cliquables ; les liens locaux conservent leur libellé et leur destination lisibles, sans résolution automatique vers une page du PDF.

Le parseur n’est pas CommonMark complet : pas de HTML exécuté, notes de bas de page, mathématiques, listes multiblocs complexes, titres Setext, résolution automatique de références Markdown ou numérotation hiérarchique implicite. Le code Typst contenu dans le Markdown reste du texte et n’est jamais évalué. Les longs blocs de code et tableaux très larges demandent une relecture manuelle ; éviter les lignes de code non sécables et les tableaux trop nombreux en colonnes. Utiliser des titres de chapitre explicites ; chaque titre de niveau 1 commence une nouvelle page. Aucun numéro de chapitre n’est ajouté aux titres déjà rédigés.

## Figures stables

Placer le marqueur sur une ligne distincte :

```text
[[FIG:DIA-04]]
[[FIG:RPT-ER]] Légende spécifique facultative
[[FIG:CAP-12]]
```

- `DIA-02` à `DIA-07` : SVG existants de `dist/diagrams/`, noms de la présentation conservés.
- `RPT-ER`, `RPT-DEPLOY`, `RPT-PUBLISH`, `RPT-SEQUENCE`, `RPT-STATES` : `report/diagrams/ID.svg`.
- `RPT-STATES` désigne les états des tâches et des tentatives d’envoi, non le parcours de recrutement.
- `CAP-10` à `CAP-15` : noms exacts de `assets/requests.md` dans `assets/images/`.
- Un identifiant inconnu attend `report/diagrams/ID.svg` et reste visible dans le manifeste.

Un fichier manquant devient un emplacement titré, portant son chemin stable et une mention explicite d’absence. Aucun faux écran n’est produit. Un fichier existant est intégré sans recadrage (`contain`), avec une légende et une entrée dans la liste des figures. Le type Typst `image` est explicite, y compris pour les emplacements manquants : ceux-ci restent donc dans la même liste des figures. La présence d’un fichier n’atteste pas sa provenance ou sa pertinence ; la revue humaine conserve cette responsabilité.

Le parseur lit les attributs vectoriels `width`, `height` et `viewBox` pour renseigner `sizing` dans le manifeste. Les RPT portrait de plus de 150 mm occupent une page dédiée, sans étirement : dimensions naturelles plafonnées à **160 × 230 mm**, laissant au moins 17 mm pour la légende dans le corps A4 de 247 mm. Les diagrammes courts ne sont pas agrandis ; les autres SVG sont plafonnés à 160 × 140 mm. Ainsi un RPT de 240 mm est légèrement réduit à 230 mm, et non à 140 mm. Cette réduction diminue aussi légèrement son texte : le minimum annoncé à la taille SVG n’est pas une garantie identique après mise à l’échelle. La géométrie n’est pas une relecture visuelle. Les captures matricielles conservent une boîte maximale de 105 mm de hauteur.

## Pagination et contrôle final

A4, corps 11 pt, marges proches de 25 mm. Les deux premières pages sont **entièrement vides** pour les couvertures institutionnelles ; viennent le résumé/mots-clés/glossaire, la table des matières et les listes de figures/tableaux, numérotés en romain. Les titres du préliminaire ne sont pas réinjectés dans le sommaire du corps. La pagination arabe commence au corps ; bibliographie ensuite. Il n’y a aucun remplissage pour atteindre artificiellement la cible de **70–84 pages de corps**.

Après intégration et compilation par le responsable, cette commande de métadonnées mesure les pages du corps (chapitres 00–07, hors couvertures, résumé/glossaire, sommaires et bibliographie), sans rasterisation :

```sh
node scripts/typst.mjs query report/pdf/main.typ '<report-main-body-pages>' --field value --one --root .
```

Le résultat est un objet `main_body_pages`, pas une attestation du contenu. La bibliographie prolonge la numérotation arabe mais reste exclue de cette mesure. La longueur finale et les débordements éventuels se vérifient après intégration réelle ; aucune garantie de 70–84 pages ne résulte du seul assemblage. La relecture visuelle appartient à l’utilisateur : aucune rasterisation, capture d’écran, automatisation navigateur ou inspection d’image n’est requise par cet outillage.

## Contrôle isolé de l’outillage

Depuis `presentation/` :

```sh
node report/scripts/check-renderer.mjs
```

Ce contrôle ne lit aucun vrai chapitre. Il importe seulement le parseur (sans déclencher son assemblage), crée un JSON synthétique dans un sous-répertoire unique de `dist/report/`, compile un PDF temporaire et interroge la métadonnée de pagination. Il vérifie notamment les clés bibliographiques nues, l’exclusion des notes de preuve et le rendu d’un tableau multipage. Il supprime uniquement son propre sous-répertoire, même en cas d’erreur ; il ne remplace jamais le vrai `report.json` ni `exports/report.pdf`. Le paramètre Typst `--input report-data=/dist/report/.../fixture.json` permet cette isolation. Aucun rendu raster ou navigateur n’est utilisé.

Le contrôle synthétique compile et la requête de métadonnées fonctionne avec Typst local 0.15.1 (qui avertit que la sous-commande `query` est dépréciée). Les seuls échantillons réels consultés pour l’adaptation sont les chapitres 01/02 terminés et `references-context.md` : 17 définitions/entrées, aucune citation non résolue pour ces deux chapitres. Cela n’atteste ni l’assemblage complet, ni les autres registres, ni la pagination finale. La compilation et la relecture du rapport réel après intégration restent à effectuer.
