# Plan et état de revue

## Décision de structure

Le 13 novembre, l’utilisateur autorise une révision proche du final sans attente entre plan, rédaction et assemblage. Les deux présentations anciennes sont seulement des inspirations. Le cadrage retenu est celui d’une pré-soutenance d’ingénierie logicielle.

| Partie | Contenus du script | Pages PDF | Intention |
|---|---|---|---|
| Couverture et plan | 01–02 | 1–2 | Poser le sujet et annoncer le fil conducteur |
| Contexte et problématique | 03–07 | 3–8 | Cadre, problème, existant, CAP et usages flexibles |
| Analyse des besoins | 08–10 | 9–12 | Acteurs, qualité, démarche réelle |
| Conception | 11–19 | 13–22 | Modèle, choix techniques, extraction, coût et contrôle humain |
| Réalisation | 20–26 | 23–30 | Six captures et coordination des intervenants |
| Validation et bilan | 27–32 | 31–37 | Preuves, démonstration, limites, acquis, perspectives, conclusion |
| Annexes | 33–34 | 38–40 | Protocole proposé et invariants, uniquement en discussion |

## Arbitrages

- Garder problème → besoins → conception → réalisation → validation, commun aux exemples ; supprimer les éléments BI/ML propres à l’autre projet.
- Remplacer les anciens chiffres de contexte par une problématique directement liée au système, sans statistiques locales inventées.
- Donner à l’IA une place technique précise : cinq familles, pipeline, source/correction, limites. Pas de RAG, entraînement ou classement automatique revendiqué.
- Conserver six diagrammes utiles et réutilisables ; éviter un diagramme par fonctionnalité ou une reproduction exhaustive du SQL.
- Parcours de réalisation linéaire, avec une capture récente par action-clé. Les anciens écrans restent dans les assets avec leur provenance.
- ODD non imposé par les exemples ni par le besoin actuel : rapprochement éventuel en note orale du bilan, pas de slide d’impact non démontré.
- Ne pas importer un kit externe : Typst + Graphviz/Mermaid existants suffisent et gardent les sources autonomes. Le lien de dépôt suggéré était mal formé ; aucune dépendance à ce lien.
- Extension à 40 pages demandée : quatre contenus utiles, sans nouveau visuel requis — modes de travail, choix techniques, économie d’extraction, coordination. CAP est explicité sans inventer l’origine du nom. Estimations économiques détaillées dans `cost-model.md` ; rapport approfondi dans `report-outline.md`.

## Gates de revue

1. **Structure :** sélection éditoriale réalisée ; retours encadrant encore possibles.
2. **Faits et rédaction :** actualisés depuis les contrats et les checkpoints du 13 novembre ; notes orales et limites incluses.
3. **Diagrammes :** sources et rendus prêts ; périmètre documenté dans `diagrams/README.md`.
4. **Visuels :** six placeholders nommés ; captures utilisateur attendues, voir `assets/requests.md`.
5. **Assemblage :** PDF Typst compilé ; syntaxe Mermaid vérifiée et quelques pages inspectées avant la demande d’arrêt des vérifications par images. Relecture visuelle finale par l’utilisateur. Ce sont des vérifications de présentation, pas des tests applicatifs.
6. **Approbation finale :** contenu, métadonnées et captures à relire par l’utilisateur/encadrant.

## Suite : rapport technique

Décisions du 13 novembre : rapport **étendu 70–84 pages**, en **français**, avec estimations de coût autorisées mais étiquetées, couverture et page de garde gardées en réserve, six captures et des diagrammes supplémentaires.

- [report-plan.md](report-plan.md) est le document de production : structure cible, répartition en pages, briefs autoportants par chapitre, sources externes datées, plan des figures. Chaque chapitre sera rédigé par un modèle distinct à partir de son brief.
- [cost-model.md](cost-model.md) : granularité réelle des appels (une requête multi-questions par extracteur, pas cinq), calcul illustratif, comparaison avec un tarif commercial publié, cadre de confiance.
- [report-frontmatter.md](report-frontmatter.md) : gabarits réservés pour les pages institutionnelles.
- [report-outline.md](report-outline.md) : plan long antérieur, non exécuté ; `report-plan.md` prime.

Les deux sous-agents de recherche externe (paysage ATS/parseurs, économie de l’extraction) ont échoué sur quota de fournisseur ; la recherche a été faite directement et ses sources sont listées dans `report-plan.md` §4. Le sous-agent de production des schémas a été relancé sur un modèle disponible.

## Version courte si nécessaire

Pour environ 15 minutes, passer rapidement les contenus 11–12 et 18 (conception), 21 et 25 (réalisation), puis fusionner oralement 27–29. Conserver problème, architecture, compromis techniques/coût, revue, décisions CSV et bilan. Les annexes ne font pas partie du temps principal. Aucune durée institutionnelle n’a été fournie.
