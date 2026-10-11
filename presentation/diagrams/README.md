# Diagrammes de présentation

Trois diagrammes, intégrés aux pages 14–16 du PDF courant :

- `DIA-02-use-cases.dot` : cas d’utilisation UML (acteurs sous forme de classificateurs stéréotypés, associations, frontière du système, contraintes propriétaire/assignation).
- `DIA-03-classes.mmd` / `.dot` : classes conceptuelles sélectionnées, avec multiplicités ; pas un schéma de toutes les tables.
- `DIA-04-architecture.mmd` / `.dot` : architecture actuelle, ports et extension future d’extraction en pointillés.

Pour classes et architecture, **modifier `models.mjs`**, puis relancer `pnpm --filter @recruitment/presentation diagram:render`. Les sources Mermaid et DOT sont générées depuis ce modèle commun. Le cas d’utilisation est édité directement dans son DOT ; Mermaid n’a pas de type natif de diagramme UML de cas d’utilisation.

Rendu SVG sous `presentation/dist/diagrams/` avec `@viz-js/viz` (Graphviz/WASM), dépendance de développement locale au workspace. Aucun navigateur ni Graphviz global nécessaires. Les SVG sont intégrés par Typst ; les `.mmd` restent disponibles pour édition/export avec Mermaid. `diagram:check` vérifie les deux sources Mermaid.

Vues de présentation soumises à relecture, pas descriptions exhaustives des permissions/tables. Le modèle conceptuel associe la correction effective à la tâche ; il ne représente pas un historique complet. Voir les contrats dans `docs/` pour les contraintes détaillées.
