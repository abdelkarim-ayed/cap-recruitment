# Coût de l’extraction — hypothèses, unités et limites

## Statut des chiffres

Révision documentaire du 13 novembre 2026. L’utilisateur rapporte des essais individuels sur des CV variés, avec des requêtes complètes de **5 000 tokens d’entrée au plus**, texte et enveloppe de requête inclus. Il ne s’agit pas d’une évaluation par lots, d’une moyenne représentative ou d’une borne garantie pour tout futur CV.

Le calcul retient **0,05 USD par million de tokens d’entrée comme hypothèse**, et non comme tarif Jev vérifié ou dépense constatée. Les conditions effectives de facturation des sorties et des autres composantes ne sont pas établies dans les pièces retenues. Aucun nouveau test, appel fournisseur ou accès à une facture privée n’a été effectué pour ce document.

## 1. Granularité réelle des appels

Le contrat de traitement est explicite : « private PDF → native Markdown → **one hydrated multi-question request** → complete validation → one immutable successful task result ». ([processing-review-api.md](../docs/current/contracts/processing-review-api.md))

Conséquences :

- **Une requête par extracteur configuré, pas par question.** Toutes les questions d’un extracteur voyagent dans la même requête, avec le Markdown du CV, la date de référence, le modèle, l’ordre des questions et les conditions acceptées.
- **Pas d’appel par famille.** Les cinq familles (formation, certification, expérience, couverture d’une liste, contexte d’une compétence) sont des types de questions, pas cinq tâches. Une candidature avec un seul extracteur CV configuré déclenche **une** requête.
- **Plusieurs extracteurs possibles**, chacun avec sa propre source : à taille comparable, le nombre d’appels croît avec le nombre d’extracteurs exécutés. Ajouter des questions peut augmenter les tokens d’entrée, sans ajouter un appel tant qu’elles restent dans le même extracteur.
- **Regroupement = moins d’échanges, requête plus grosse.** C’est un compromis assumé : moins d’admissions, une unité d’échec plus large.

## 2. Formule

Pour la part d’entrée d’une requête :

`C_entrée_USD = tokens_entrée × prix_entrée_par_million / 1 000 000`

Pour la facture fournisseur :

`C_fournisseur = somme_des_parts_entrée + autres_composantes_contractuelles`

Les autres composantes sont **inconnues ici**. Une réponse catégorielle, une distribution ou un champ d’usage ne démontrent pas qu’une génération de tokens de sortie est facturée séparément. Si le contrat fournisseur définit une telle unité, utiliser son volume facturable et son prix ; s’il utilise une autre unité, appliquer cette unité. Ne pas substituer par analogie le modèle de prix d’une API de génération textuelle. Inconnu ne signifie ni gratuit ni nécessairement facturé.

Sous l’hypothèse utilisateur « ≤ 5 000 tokens d’entrée, tout compris, et 0,05 USD par million » :

| Projection, non lot évalué | Tokens d’entrée | Coût d’entrée uniquement | Autres composantes |
|---|---:|---:|---|
| 1 CV, 1 extracteur, 5 k tokens d’entrée | 5 000 | 0,00025 USD | inconnues, selon contrat applicable |
| 1 CV, 1 extracteur, 1 500 tokens d’entrée | 1 500 | 0,000075 USD | idem |
| 100 CV, 1 extracteur, 5 k tokens | 500 000 | 0,025 USD | idem |
| 1 000 CV, 1 extracteur, 5 k tokens | 5 000 000 | 0,25 USD | idem |

La conversion correcte est **0,00025 USD = 0,025 cent US**, pour l’entrée d’une requête de 5 000 tokens. Mille documents avec un extracteur et une requête de cette taille chacun représentent **0,25 USD d’entrée uniquement**. Le tableau n’applique aucun multiplicateur de cinq familles et aucun doublement supposé pour les sorties.

Ces montants découlent d’hypothèses. Ils ne décrivent pas une dépense observée et ne garantissent aucun débit.

## 3. Traitements locaux et coût total

Étapes exécutées sur CPU local, sans facturation de tokens :

- lecture native du PDF en processus enfant borné (`pdf-inspector@1.25.2`) ;
- production du Markdown, contrôle des bornes (10 Mio, 20 pages, 60 000 caractères, 8 s, 192 Mio de tas V8) ;
- validation complète des réponses avant persistance ;
- caches privés de parsing (par empreinte PDF/version/options) et de réponse validée (par empreinte de la requête effective complète) ;
- persistance PostgreSQL, stockage des documents, interface de revue, export CSV.

« Local » ne veut pas dire « gratuit » : CPU, mémoire, disque, énergie, exploitation et développement sont des coûts réels, simplement non facturés au token par Jev. La revue humaine a également un coût. Aucune comptabilité disponible ne permet ici de désigner le poste dominant ou de calculer le coût total de possession.

## 4. Comparaison commerciale : périmètre non établi

Aucun ratio de prix commercial n’est retenu. Un prix de traitement documentaire générique par page ne peut pas être attribué sans vérification à un produit de parsing de CV facturé éventuellement par document ou par crédit. Les anciennes extrapolations par page, le montant annuel spéculatif et l’affirmation d’un avantage de plusieurs centaines de fois sont retirés.

Une comparaison future devrait identifier le produit exact, sa date tarifaire, l’unité facturable, les engagements et le périmètre fourni : formats, OCR, langues, normalisation, disponibilité, maintenance et assistance. Elle devrait comparer un service complet à un service comparable, et non une seule composante d’entrée à un abonnement englobant plusieurs fonctions. Aucun avantage général de coût ou de qualité n’est établi ici.

## 5. Temps : modèle sans durée inventée

`temps_avant_information_utile = attente_travail + lecture_PDF_locale + attente_admission + transport_fournisseur + validation_cache_persistance + temps_revue_RH`

Le dépôt n’attend pas l’extraction : il enregistre le travail et rend la main. Le réveil est borné en mémoire, avec un balayage périodique en base pour les réveils manqués ou débordants. Un cache de réponse valide peut éviter un transport ; une tâche réussie n’est pas relancée. Une reprise locale depuis le cache conserve l’usage original et ne constitue pas une nouvelle observation de facturation. Ces mécanismes ne donnent aucune durée moyenne sans mesure.

Mesures proposées, non exécutées : taille du PDF, unités réellement facturables selon le contrat, extracteurs et transports effectués, état des deux caches, durées par phase, échecs et incertitudes, corrections et temps de revue. Médiane et p95 ne seraient publiés qu’avec effectif et conditions. La collecte réelle exige un périmètre et un consentement propres ; aucun appel payant n’est nécessaire pour écrire la méthode.

## 6. Utilité et responsabilité humaine

Le résultat documentaire facilite la consultation de champs, mais ne décide de rien. Une correction RH prévaut dans la valeur effective sans devenir une preuve infaillible de la réalité du CV. La source, l’original, la correction et la décision restent distincts.

Le faible montant d’entrée obtenu sous hypothèses ne démontre pas l’utilité du dispositif. Celle-ci demanderait d’observer recherche d’information, erreurs résiduelles, corrections et temps de revue dans des conditions comparables. Aucun volume de candidatures ni charge de travail de l’organisme d’accueil n’est déduit d’une statistique externe.

## 7. Cadre de confiance

Les sources implémentent plusieurs mécanismes de contrôle humain, dont l’acceptation complète reste ouverte :

- chaque champ est corrigible indépendamment, avec auteur et date ; l’original et la correction restent distincts ;
- une décision de présélection ou de rejet est humaine et explicite ; aucun résultat d’extraction ne la déclenche ;
- une proposition d’embauche exige une action explicite du propriétaire ; elle n’est jamais automatique.

L’absence de classement ou de décision automatique ne permet pas, à elle seule, de déduire une exemption ou une conformité juridique. Le présent modèle économique n’effectue aucune qualification réglementaire. Il décrit une assistance limitée et les hypothèses nécessaires à son chiffrage.

## Sources et portée

- [Contrat courant](../docs/current/contracts/processing-review-api.md), consulté le 13 novembre 2026 : unité d’extraction, préparation native, caches, provenance, corrections et exports.
- [Garde-fous Jev](../docs/current/jev-safety.md), même date : admission, connaissance durable des envois et limites de vérification. Un cache absent après envoi connu n’autorise pas une nouvelle dépense.
- Indication utilisateur du 13 novembre 2026 : essais individuels variés, au plus 5 000 tokens d’entrée tout compris ; pas de campagne par lots. L’hypothèse de prix est séparée de cette observation.
- [Références du rapport](report/references-extraction.md) : registre des pièces mobilisées aux chapitres 5 et 6.
