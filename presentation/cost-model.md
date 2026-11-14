# Estimation du coût fournisseur

## Tarif et unité

Le [centre d’aide officiel TypeSafe](https://help.typesafe.ai/articles/5187202169-how-much-does-jev-cost), consulté le 13 novembre 2026, annonce **0,042 USD par million de tokens d’entrée ; sorties gratuites**. La configuration de CAP utilise directement `https://api.typesafe.ai/v1/systemone`, modèle `jev-1.14.0` (`apps/api/src/integrations/jev/jev.config.ts`), sans intermédiaire tarifaire dans ce chemin.

Un extracteur regroupe toutes ses questions dans **une requête**, avec le document Markdown, la date de référence et les critères. Cinq familles de questions ne signifient pas cinq appels. Plusieurs extracteurs constituent plusieurs unités d’exécution.

## Scénarios conditionnels

`coût_USD = tokens_entrée_complets × 0,042 / 1 000 000`

| Tokens d’entrée par requête | USD par requête | USD pour 1 000 requêtes |
| ---: | ---: | ---: |
| 2 000 | 0,000084 | 0,084 |
| 5 000 | 0,000210 | 0,210 |
| 8 000 | 0,000336 | 0,336 |

Les tokens comprennent le document et l’ensemble des questions et critères. Ces lignes sont des scénarios arithmétiques : ni moyenne mesurée, ni plafond garanti à partir d’un nombre de pages, ni facture observée. L’hébergement, le stockage, la préparation locale et la revue humaine sont hors de cette estimation fournisseur. Aucun avantage économique sur un ATS complet n’en est déduit.

## Coût et débit

Les caches peuvent éviter un nouveau calcul pour une préparation ou une requête identique ; ils ne garantissent pas l’absence de coût répété pour des requêtes différentes ou un envoi d’issue inconnue. La reprise d’une réponse déjà sauvegardée n’est pas un nouvel appel.

Les limites de démonstration (trois admissions par minute, vingt au total, une active) restent distinctes du tarif public. Elles ne constituent pas un dimensionnement de production. Le délai jusqu’au résultat comprend attente, préparation, admission, transport, validation et persistance ; aucun temps moyen n’a été mesuré pour ce modèle économique.

## Sources

- [TypeSafe — How much does Jev cost?](https://help.typesafe.ai/articles/5187202169-how-much-does-jev-cost), consulté le 13 novembre 2026.
- [Contrat de traitement CAP](../docs/current/contracts/processing-review-api.md) : requête groupée, caches et valeurs effectives.
- `apps/api/src/integrations/jev/jev.config.ts` : endpoint et modèle configurés.
