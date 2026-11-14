# Notes de suite — projet, rapport et démonstration

Le projet est considéré **terminé comme prototype dans le périmètre retenu**. Le rapport et la présentation constituent la version de travail à conserver. Cette fiche rassemble uniquement les informations manquantes et quelques vérifications utiles si une nouvelle séance est décidée : **ce n’est ni une réouverture de l’ancien backlog qualité, ni une condition de publication**.

La revue du PDF porte sur le document, pas sur l’acceptation fonctionnelle de l’application. Une description dans le mémoire ne vaut pas exécution du scénario. Ne changer un résultat ou cocher un point qu’après une observation correspondante. Aucun test, appel payant ou changement de configuration n’est lancé par cette liste.

## Informations à compléter par l’étudiant

- **BeeCoders et mission** : ajouter ultérieurement un court paragraphe factuel sur l’équipe d’accueil, la demande et le rôle du projet, après confirmation. Aucune description inventée ni explication de manque dans le rapport.
- **École et dépôt** : année, diplôme/spécialité, encadrants et fonctions, langues/résumés, couverture et format imposé. Le PDF commence par la page de garde provisoire, sans page blanche.
- **Contributions** : valider l’attribution du travail personnel, des composants tiers et de l’assistance selon les règles de l’établissement.

## Application : vérifications éventuelles à forte valeur

À choisir pendant la préparation de démonstration, sans reprendre toutes les anciennes cartes de contrôle. Conserver une courte note de version, acteurs, action et résultat si un parcours est effectivement réalisé.

| Sujet | Vérification ciblée, si retenue | Conséquence documentaire éventuelle |
| --- | --- | --- |
| Parcours complet | Publication → nouveau dépôt → revue/correction → présélection → proposition → embauche | Décrire au chapitre 6 le chemin réellement parcouru, sans généraliser à toute l’application |
| Documents privés | Comptes distincts : autre candidat, interviewer non affecté/affecté et RH ; vérifier aussi la route de téléchargement directe | Conserver les frontières d’accès qui correspondent aux réponses réellement retournées |
| CSV | Export → décisions → aperçu → confirmation → états ; inclure une proposition invalide ou périmée | Mettre à jour le résultat seulement si observé ; vérifier que réponses et corrections documentaires restent inchangées |
| Démonstration | Répéter depuis l’état de départ prévu et vérifier comment retrouver cet état | Aligner scénario, captures, noms et mode d’exécution ; distinguer préparation et transitions faites pendant la séance |
| Exemple documentaire | En cas de modification de l’exemple ou du domaine, recouper extrait, question, modèle et conversion booléenne avec la paire enregistrée | Garder séparés résultat enregistré et correction humaine illustrative ; correspondance textuelle déjà inspectée lors de la rédaction, pas de nouvel appel nécessaire |

## Seulement si une question précise subsiste

- **Entretiens et conflits** : un Fail éliminatoire, les prérequis et droits de finalisation, une replanification ; au besoin une révision périmée ou une décision pendant le traitement. Ne pas transformer ce rappel en nouvelle campagne générale.
- **Traitement documentaire** : si le lancement ou la reprise doit être expliqué, recouper découverte des travaux, baux, redémarrage et caches. Une reprise locale depuis cache reste distincte d’un nouvel envoi fournisseur.
- **Configuration Jev** : conserver les contrôles actuels ; distinguer concurrence, trois admissions/minute, vingt au total, timeout HTTP et délai de nouvelle tentative. Ne modifier ni limites, compteurs, clés ni politique d’envoi incertain pour faciliter une démonstration.
- **Confiance** : si le code évolue, vérifier le maintien de la distinction entre confiance faible, absence de mention, réponse négative, échec d’extraction et correction humaine nulle. Le rapport décrit la version sans seuil automatique.
- **CI et installation** : si un résultat CI ou un déploiement est ajouté au bilan, préciser ce qui a réellement tourné. Construction/types et tests conditionnels ne constituent pas une campagne complète ; réception SMTP, stockage persistant et installation se décrivent selon l’environnement effectivement utilisé.

## Dernière préparation des supports

- Relire visuellement le PDF final : renvois de chapitres, blocs de code, captures petites, légendes et suites de tableaux, coupures, liens et URL bibliographiques.
- Conserver [le scénario](report/demo-script.md) et [le guide du présentateur](report/presenter-guide.md) : parcours, permissions, transactions/révisions, construction Jev, original/correction/effectif et observations exploratoires.
- Aligner diapositives, discours et mode réel de démonstration. Ne pas présenter un état présemé comme une transition à l’instant.

**Aucune extension demandée** : pas d’OCR, embeddings, attribution de dossiers ou tableau de monitoring à ajouter pour conclure ce prototype. Toute reprise de développement serait une demande distincte.
