# Diagrammes complémentaires du rapport

Cinq sources **DOT éditables** et leurs **SVG vectoriels** correspondants. Ce
sont de nouvelles productions à partir des sources actuelles, pas la reprise de
fichiers temporaires disparus. Les DIA-02 à DIA-07 existants ne sont pas modifiés.

| Identifiant | Vue | Choix de lisibilité |
|---|---|---|
| RPT-ER | Sous-ensemble physique du schéma CV | Huit tables, clés sélectionnées ; flèches FK vers la table référencée |
| RPT-DEPLOY | Topologie locale logique | Processus API explicite ; ressources et relations détaillées dans un panneau séparé |
| RPT-PUBLISH | Transaction de publication | Flux principal et encadrés séparés pour les conflits et la course avec le plan |
| RPT-SEQUENCE | Séquence chronologique de traitement | Séquence tabulaire, puis alternatives rattachées à leur étape ; pas six petites lignes de vie |
| RPT-STATES | Tâche, garde d’envoi, barrière métier | Deux machines distinctes et un encadré de fermeture non assimilé à un état |

## Compiler les vecteurs uniquement

Depuis la racine du dépôt :

```sh
node presentation/report/diagrams/render.mjs
```

Le script réutilise `@viz-js/viz` **déjà installé dans `presentation`**. Il ne
charge aucun module applicatif, ne démarre aucun service et ne lance aucun test,
appel fournisseur, navigateur, rendu raster ou assemblage PDF. Il écrit seulement
les cinq SVG de ce dossier ; aucune installation supplémentaire n’est nécessaire.

Palette : blanc, ardoise `#172B4D`, vert `#0F766E` ; police Liberation Sans.
Chaque SVG conserve son `viewBox` et une taille physique maximale de **160 ×
240 mm** pour le corps d’une page A4 portrait. Ne pas étirer les figures à hauteur
constante ; garder leurs proportions. Le script affiche dimensions et plus petit
corps de texte calculé après mise à l’échelle : c’est un contrôle géométrique,
**pas une relecture visuelle**. Éditer les DOT puis régénérer les SVG, pas l’inverse.

Compilation vectorielle et parsing XML effectués le 13 novembre 2026 : cinq SVG
bien formés, sans élément image raster ; liens locaux du catalogue résolus.

| Figure | Taille SVG (mm) | Plus petit texte calculé |
|---|---:|---:|
| RPT-ER | 149,2 × 219,4 | ≈ 10,0 pt |
| RPT-DEPLOY | 160,0 × 236,6 | ≈ 8,1 pt |
| RPT-PUBLISH | 91,7 × 240,0 | ≈ 9,2 pt |
| RPT-SEQUENCE | 111,6 × 240,0 | ≈ 9,7 pt |
| RPT-STATES | 155,2 × 240,0 | ≈ 8,6 pt |

Graphviz/WASM émet un avertissement de métrique pour un caractère non ASCII
(`194`, largeur de repli égale à une espace) lors du premier rendu RPT-ER ; pas
d’erreur de rendu ni d’arête perdue dans les sorties finales. Les SVG conservent
le texte Unicode ; alignement, police effective et accents restent à relire
manuellement. Le script refuse un texte calculé inférieur à 8 pt ; cette borne
géométrique n’est pas une garantie typographique.

## Portée et réserves

- Légendes, sources précises et omissions : [catalogue](../figures.md).
- Les figures décrivent le code lu le **13 novembre 2026**. Elles ne démontrent ni
  QA PostgreSQL/HTTP/races, ni qualité d’extraction, ni garantie de reprise payante.
- Le contrat récent de traitement et son code prévalent ici sur les anciennes
  phrases de l’architecture générale qui disent encore « pas de poller/cache ».
- La topologie n’est ni un relevé de processus actifs, ni un déploiement de
  production. Aucune adresse, identité, clé, donnée privée ou valeur de runtime
  n’est reproduite. Les modes fixture/offline ne sont pas des réponses Jev réelles.
- Pas de rasterisation, lecture d’image ou vérification visuelle par l’agent ; la
  validation de mise en page revient à l’utilisateur.
