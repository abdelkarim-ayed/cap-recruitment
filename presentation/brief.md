# Brief — pré-soutenance PFE

## Cadrage retenu le 13 novembre 2026

- Présentation en français pour une nouvelle revue par l’encadrant, proche de la version finale, sous contrainte de temps utilisateur.
- Projet d’ingénierie logicielle : plateforme de recrutement avec assistance documentaire IA. Ni projet de prédiction d’embauche ni entraînement d’un modèle.
- Travail autorisé directement sur main : restructuration, rédaction, diagrammes, assemblage Typst/PDF et placeholders. Les exemples anciens servent d’inspiration, pas de cahier des charges.
- Délégation de tâches bornées explicitement autorisée avec GPT-6.1 Sol : lecture des exemples, synthèse des faits, diagrammes.
- Après précision utilisateur : 34 diapositives principales dont couverture et plan, deux annexes, six intercalaires : 42 pages. Équilibre recherché entre produit et compétences d’ingénierie ; rapport plus technique et approfondi. Durée de travail suggérée : 20–25 minutes avec parcours sélectif, à adapter à la consigne réelle.
- Les étapes intermédiaires de validation ne bloquent plus cette révision : l’utilisateur demande une version assemblée. La validation finale du contenu reste humaine.

## À compléter

- Établissement, formation, éventuel encadrant académique distinct, date exacte. Développement éditorial proposé du nom existant : CAP = Centralisation et Assistance au Parcours de recrutement, sans origine historique revendiquée.
- Six captures récentes : [demandes précises](assets/requests.md). Anciens visuels conservés, sans les présenter comme preuve de l’interface actuelle.
- Logos officiels facultatifs ; aucun logo ni écran produit inventé.
- Le contexte privé annoncé n’a pas été retrouvé : `docs/.ignore/` ne contient ici que `tmp/`, avec un ancien SVG de présentation, un spike et un script de transfert. Ne pas déduire de faits personnels manquants.

## Limites de preuve

Le worker réel et le lecteur PDF natif sont intégrés ; la qualité de l’extraction intégrée n’est pas mesurée. Le CSV de décisions, le gel du plan à publication, les corrections par champ et les règles de décision sont implémentés. Les contrôles datés ne constituent pas une régression complète actuelle. Aucune précision, réduction de temps, enquête terrain, méthode Scrum formelle ou validation production n’est inventée.

Références : [notes et sources](notes.md), [script et notes orales](draft.md), [plan de revue](plan.md).

## Précisions produit et économie

Recrutement généraliste dans un périmètre borné : travail RH partagé, responsabilités finales, affectation des entretiens et notifications ciblées. CSV exploitable dans un tableur ou un outil externe, dont IA, sans prétendre à des connecteurs natifs. Lecture PDF sur CPU local sans OCR ; extraction sémantique externe. Coût illustratif selon hypothèses utilisateur, pas mesure réelle : [modèle](cost-model.md). L’exemple de rapport est une inspiration extérieure, pas une norme de l’établissement.

## Rapport technique — décisions du 13 novembre

- **Étendu, 70–84 pages**, en **français** comme la présentation.
- **Estimations de coût autorisées** mais étiquetées ; la granularité réelle est d’**une requête multi-questions par extracteur**, pas une par famille.
- **Couverture et page de garde en réserve** : gabarits vides dans [report-frontmatter.md](report-frontmatter.md), modèle institutionnel à fournir.
- **Huit captures** reçues le 13 novembre (dont boîte de réception et export CSV), six diagrammes et deux logos officiels ; les fichiers servent au deck et au rapport.
- **Rédaction par chapitre, modèles distincts** : briefs autoportants dans [report-plan.md](report-plan.md), dispatch et contrôles dans [report-orchestration.md](report-orchestration.md).
- **Recherche externe** : paysage ATS/parseurs, tarifs publiés, AI Act et NIST, avec URL et date de consultation, dans `report-plan.md` §4.
