# Visuels à fournir

**Reçus et intégrés** : les six images numérotées 3, 20, 21, 22, 25 et 27 ont été déplacées depuis `~/Downloads` vers `assets/images/`. Originaux conservés sans recadrage ni retouche, proportions respectées. Les descriptions ci-dessous servent de référence de provenance ; aucune de ces six images ne reste à fournir.

Pagination du PDF actuel : **36 pages** (30 contenus + 6 intercalaires). Référence générée : `../dist/page-map.md`. Les images retournées sous les noms ci-dessous sont intégrées automatiquement au prochain `pdf:build`.

## Image à générer par un modèle externe

### IMG-01 · Page 3 · Contexte : acteurs du recrutement

- **Fichier** : `presentation/assets/images/IMG-01-contexte-recrutement.png`
- **Format** : paysage 4:3, idéalement 1600 × 1200 px ; fond blanc ou très clair.
- **Rôle** : illustrer le travail collectif autour d’un dossier de candidature. Facultatif ; aucune autre image générée nécessaire.
- **Prompt prêt à copier** :

> Illustration éditoriale sobre pour une présentation universitaire francophone sur une plateforme de recrutement en entreprise. Trois personnes adultes, aux apparences variées, collaborent autour d’une table avec un dossier de candidature et un ordinateur portable. Une personne consulte le dossier, une autre prend des notes, la troisième participe à l’échange. Composition claire, légèrement stylisée, volumes simples, perspective naturelle. Palette bleu ardoise #172B4D, vert profond #0F766E, gris clair et blanc. Grand espace négatif, lumière douce, détails peu nombreux. Format paysage 4:3. Aucun mot, aucune lettre, aucun chiffre, aucun logo, aucune interface lisible. Pas de robot, pas de cerveau lumineux, pas de sélection automatique ni classement des personnes. Illustration de coordination humaine, sans imitation d’une capture d’application.

Ne pas demander de texte au modèle : les acteurs et leurs rôles figurent déjà sur la slide.

## Captures réelles à fournir manuellement

Ces visuels viennent de l’application, **pas d’un générateur d’images**. Utiliser les comptes/dossiers synthétiques de la démo, recadrer une zone lisible et conserver les mentions fixture lorsque pertinentes. Aucun mot de passe, code de vérification ou identité réelle visible. Les noms correspondent aux emplacements actuels.

| Page PDF | Fichier dans `presentation/assets/images/` | Zone à montrer |
|---|---|---|
| **20** | `CAP-02-configuration-offre.png` | Configuration d’une offre : quelques champs de formulaire et un document attendu. Si possible, lien avec la tâche d’extraction, sans tout afficher. |
| **21** | `CAP-03-depot-candidature.png` | Formulaire candidat renseigné avec données synthétiques et document joint, ou confirmation de dépôt. |
| **22** | `CAP-04-dossier-rh.png` | Liste de candidatures RH avec filtres et quelques lignes lisibles, ou vue d’ensemble d’un dossier. |
| **25** | `CAP-05-correction-rh.png` | Résultat fixture et dernière correction RH effective. Afficher les libellés qui distinguent résultat original et correction. |
| **27** | `CAP-06-agenda.png` | Agenda avec un rendez-vous synthétique et les informations de planification utiles. |

Préférer un recadrage paysage, environ 1600 px de large. Les données/manipulations doivent être réelles ; ne pas fabriquer un état d’entretien pour obtenir une capture. La mise en page pourra donner davantage de place à une capture reçue si nécessaire.

## Diagrammes déjà réalisés : aucune génération externe

| Page PDF | Visuel | Code et rendu |
|---|---|---|
| **14** | UML : cas d’utilisation | `diagrams/DIA-02-use-cases.dot` → `dist/diagrams/DIA-02-use-cases.svg` |
| **15** | UML : classes conceptuelles | `diagrams/models.mjs` → `DIA-03-classes.mmd` et `.dot` → SVG |
| **16** | Architecture modulaire | `diagrams/models.mjs` → `DIA-04-architecture.mmd` et `.dot` → SVG |

Les sources Mermaid sont syntaxiquement vérifiées. Les SVG intégrés sont rendus localement par Graphviz/WASM à partir des mêmes données, sans navigateur. Mermaid n’ayant pas de notation native dédiée aux cas d’utilisation UML, cette vue utilise directement DOT.

## ODD et couverture

- **Page 33** : pas d’image générée nécessaire. Une icône officielle ODD 8 peut être ajoutée ultérieurement depuis les ressources de l’ONU, sans la redessiner par IA.
- **Page 1** : fournir plus tard les métadonnées et éventuels logos autorisés ; nom CAP à confirmer. Champs centralisés dans `presentation/metadata.json`.
