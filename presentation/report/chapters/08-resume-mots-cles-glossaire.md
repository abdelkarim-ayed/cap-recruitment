# Résumé, mots-clés et glossaire

## Résumé

Ce projet de fin d’études porte sur la conception et la réalisation de CAP, une plateforme de recrutement associant gestion des candidatures et assistance documentaire facultative. L’objectif est de centraliser les informations du parcours et de faciliter leur exploitation tout en conservant des responsabilités humaines explicites.

La solution repose sur une API NestJS, une interface React/Vite, un domaine TypeScript/Zod partagé, PostgreSQL et un stockage documentaire privé. Elle couvre les offres configurables, le dépôt authentifié, la revue partagée, les entretiens et les décisions de recrutement. Les contrôles d’accès contextualisés et les mécanismes transactionnels encadrent les modifications concurrentes. L’assistance prépare le texte des PDF et produit des réponses structurées à des questions définies pour l’offre ; la revue permet de consulter la source et de corriger les champs. Les échanges CSV complètent le parcours par l’export d’informations et l’import confirmé de décisions.

Le résultat est un prototype intégré, accompagné de scénarios synthétiques et de contrôles ciblés. Les explorations documentaires ont contribué à préciser les questions et leurs ambiguïtés. Les perspectives prioritaires concernent l’acceptation transversale, l’évaluation des réponses sur des exemples indépendants et la préparation de l’exploitation.

## Mots-clés

Recrutement ; assistance documentaire ; extraction structurée ; revue humaine ; cohérence transactionnelle ; confidentialité ; interopérabilité CSV.

## Glossaire

[[TABLE:glossaire-termes]] Termes et définitions du rapport.

| Terme | Définition dans ce rapport |
| --- | --- |
| CAP | Plateforme de centralisation et d’assistance au parcours de recrutement. |
| ATS | *Applicant Tracking System* : système de suivi des candidatures et des étapes du recrutement. |
| Candidature | Dossier reliant un candidat à une offre, avec ses réponses et les documents conservés au dépôt. |
| Propriétaire d’offre | Membre RH responsable d’une offre, notamment de sa publication et de l’enregistrement d’une proposition. |
| Plan d’entretien | Liste ordonnée des étapes d’entretien prévues pour une offre ; distincte des rendez-vous programmés. |
| Présélection | Décision initiale de poursuite d’une candidature, avant proposition ou embauche. |
| Proposition | Étape enregistrant une proposition au candidat, correspondant à *Offer* ; distincte du poste publié et de l’embauche. |
| Traitement documentaire | Exécution des tâches automatiques configurées sur les documents. |
| Revue partagée | Consultation et correction des informations par les ressources humaines habilitées. |
| Libération manuelle | Action fermant le traitement inachevé pour ouvrir la revue, sans déclarer les tâches réussies. |
| Extracteur | Configuration regroupant des questions documentaires et produisant des réponses structurées. |
| PDF natif | PDF comportant une couche texte directement exploitable par un lecteur. |
| OCR | Reconnaissance optique de caractères à partir d’images. |
| Résultat original | Réponse du traitement documentaire conservée séparément de la correction humaine. |
| Correction humaine | Valeur saisie pendant la revue pour un champ documentaire. |
| Valeur effective | Valeur utilisée pour la consultation ou l’export : correction présente, sinon résultat original. |
| Projection | Ensemble des informations retournées à un acteur dans un contexte donné. |
| Révision | Compteur permettant de détecter une modification concurrente d’une ressource. |
| Bail de traitement | Autorisation temporaire d’exécuter une tâche, assortie d’une expiration et d’un contrôle des écritures. |
| Passerelle Jev | Composant centralisant les appels au service d’interprétation et les contrôles d’admission. |
| Cache de réponse | Conservation d’une réponse validée associée à une requête donnée. |
| CSV | Format textuel tabulaire utilisé pour les exports et les propositions de décisions importées. |
