# Chapitre 6 — Vérification, démonstration et discussion critique

## Introduction

Un prototype peut réunir des règles métier détaillées, une interface utilisable et une architecture cohérente sans avoir encore démontré toutes les propriétés attendues en exploitation. L’évaluation doit donc répondre à plusieurs questions séparées : les sources expriment-elles les règles annoncées ? Quels comportements ont été observés ? Sur quelle version et dans quelles conditions ? Quelles conclusions demeurent hors de portée ? Cette séparation est particulièrement importante pour l’assistance documentaire, où un résultat bien formé peut être faux et où une préparation locale réussie ne démontre pas la qualité d’un appel réel.

Ce chapitre établit un bilan documentaire arrêté au 13 novembre 2026. Il exploite les checkpoints existants, les retours utilisateur conservés et la provenance des jeux synthétiques. Aucun nouveau test, appel fournisseur ou parcours d’interface n’a été exécuté pour sa rédaction. L’objectif n’est pas de remplacer les vérifications restantes par un récit favorable, mais de faire apparaître les acquis utilisables et les questions auxquelles les preuves actuelles ne répondent pas.

La première partie définit la lecture des preuves et présente un registre daté. La deuxième distingue démonstration de cycle de vie, corpus exploratoire et observations utilisateur. La dernière propose des méthodes d’évaluation sémantique, économique et opérationnelle, puis discute les menaces à la validité. Ces protocoles sont des propositions non exécutées ; leurs critères ne sont pas présentés comme des résultats du projet.

## 6.1. Construire une lecture proportionnée des preuves

### 6.1.1. Une assertion doit conserver son périmètre

Une preuve utile associe une assertion, un artefact, une date, une version ou un checkpoint et une limite. « La compilation est passée » indique une compatibilité statique des composants concernés ; cela ne signifie pas qu’une candidature peut accomplir tout son parcours. « Une fixture a terminé » montre un chemin déterminé de préparation et de persistance ; cela ne démontre ni l’exactitude d’un fournisseur ni l’isolation de deux comptes. La portée doit rester attachée au résultat lorsqu’il est repris dans un tableau de synthèse [REF-EXTRACT-STATUS].

Le statut d’implémentation décrit ce qui existe dans les sources. Le statut d’observation décrit ce qui a été effectivement constaté dans un environnement donné. Le statut d’acceptation suppose des critères et une vérification suffisamment complète du périmètre annoncé. Enfin, une perspective ou un protocole décrit ce qui pourrait être fait. Ces quatre registres ne sont pas interchangeables. Une fonctionnalité dont la QA reste ouverte n’est pas automatiquement une fonctionnalité absente ; inversement, sa présence ne ferme pas la QA.

| Nature de preuve | Ce qu’elle peut soutenir | Ce qu’elle ne suffit pas à établir |
|---|---|---|
| Contrat et lecture de source | Règle, représentation, contrôle prévu et ordre des opérations | Exécution correcte dans tous les cas |
| Build et vérification de types | Compatibilité statique et assemblage du périmètre construit | Parcours métier, autorisation ou qualité IA |
| Modèle et ports simulés | Comportement sous hypothèses contrôlées | Transactions, verrous ou pannes réelles de PostgreSQL |
| DOM simulé | États et interactions rendus dans l’environnement de test | Dialogues, historique et focus natifs du navigateur |
| Préparation locale et readiness | Migrations ou dépendances opérationnelles observées à une date | Acceptation fonctionnelle et confidentialité |
| Parcours utilisateur rapporté | Faisabilité déclarée d’une séquence identifiable | Couverture exhaustive des rôles et courses |
| Paire requête-réponse archivée | Sortie effectivement associée à une requête historique | Vérité de la réponse et performance de la version intégrée |

### 6.1.2. Choisir les sources selon leur fonction

Les contrats actuels font autorité pour les règles applicables. Le fichier de statut conserve les vérifications datées, y compris des limitations devenues historiques après une évolution. Le catalogue de démonstration décrit les états déclarés du jeu synthétique. L’archive de laboratoire établit une provenance expérimentale, pas le contrat du runtime. Cette hiérarchie évite deux erreurs : lire une ancienne mention « migration non appliquée » comme l’état présent, ou utiliser un README de transfert antérieur pour nier une intégration ultérieure [REF-EXTRACT-CONTRACT] [REF-EXTRACT-LAB].

Les nombres de tests successifs ne sont pas additionnés. Un même cas peut apparaître dans plusieurs checkpoints et une suite ancienne peut précéder une évolution du modèle. Le total arithmétique donnerait une impression artificielle de couverture. La question pertinente est plutôt : quel invariant cette famille de contrôles examine-t-elle, et quelle partie de l’invariant dépend encore d’un environnement réel ?

## 6.2. Registre daté des vérifications disponibles

Le tableau suivant sélectionne les jalons qui éclairent les mécanismes du rapport. Les résultats sont repris de `docs/current/status.md`, sans relance ni réinterprétation en succès global. Les identifiants Q-* désignent les travaux d’acceptation encore ouverts dans le suivi du projet [REF-EXTRACT-STATUS] [REF-EXTRACT-BOARD].

| Date et périmètre | Éléments consignés | Portée et reste ouvert |
|---|---|---|
| 31 octobre 2026, ancien checkpoint d’extraction de compétences | Contrôles API, domaine et DOM ; intégration réelle PDF/PostgreSQL avec fixture, correction et export | Preuve historique du périmètre antérieur, pas acceptation du contrat CV version 2 |
| 7 novembre 2026, B1-R | Builds et contrôles hors ligne de préparation, libération et politiques | Modèles et ports simulés ; Q-B1R conserve SQL, HTTP authentifié, confidentialité, rollback et courses |
| 7 novembre 2026, B1-J et R3c | Contrôles ciblés des projections, filtres, brouillons et sauvegardes sans effet | Ne démontrent pas la parité réelle liste/compteur/export ni la concurrence de corrections ; Q-B1J et Q-R3C ouvertes |
| 7 novembre 2026, R3d-a/b/c | Cas DOM de navigation sale, sauvegarde en cours, conflit et abandon explicite | Comportement natif du navigateur et réponses réellement retardées ou ambiguës encore à vérifier |
| 7 novembre 2026, préparation T2a | Cinq offres, 25 candidatures et 25 documents initialisés ; empreintes privées vérifiées ; readiness directe et proxifiée | Préparation observée, pas parcours authentifiés ni répétabilité complète ; Q-T2A partielle |
| 9 novembre 2026, cohérence UI | Build/typecheck web et sept contrôles ciblés de cohérence finale, après contrôles de tranches précédentes | Pas de régression exhaustive ni de nouvelle preuve SQL/HTTP ; gates UI et antérieures maintenues |
| 13 novembre 2026, fondations du nouvel extracteur | Schémas transférés, contrôles hors ligne ciblés ; 20 paires et 102 réponses structurellement valides ; trois lectures PDF sur deux identités concordantes avec les octets Markdown transférés | Avant intégration finale ; ni justesse sémantique ni reprise réelle concurrente démontrées |
| 13 novembre 2026, installation et démarrage hors ligne | Builds domaine/API/web, migrations 009/010, recréation des cinq offres/25 scénarios ; une tâche présemée achevée par lecture native et réponse fixture, caches écrits | Aucun dépôt authentifié ni parcours complet revue/export ; pas de résultat fournisseur réel établi par cette observation |
| 13 novembre 2026, correction du worker réel | Source construite, démarrage du runner Jev restreint aux nouvelles soumissions synthétiques, credential initialement vide, ordre cache-avant-règlement documenté | Pas de validation live, reprise après panne, concurrence ou rotation réelle ; aucun succès payé déduit du démarrage |

### 6.2.1. Ce que les modèles ont effectivement apporté

Les contrôles hors ligne ne sont pas dépourvus de valeur. Ils isolent des décisions délicates : validation avant écriture, distinction correction présente et valeur effective égale, maintien des champs voisins, refus d’une révision périmée, libération sans succès fabriqué ou navigation conservant un brouillon. Ils rendent des règles explicites et reproductibles dans un environnement déterministe. Ils peuvent aussi révéler des incohérences d’interface ou de sérialisation avant une intégration plus coûteuse.

Leur limite vient des hypothèses simulées. Un modèle de transaction sérialisée suppose déjà un ordre que PostgreSQL doit réellement imposer. Une capture SQL établit qu’une requête utilise les paramètres attendus, pas que les trois vues liste, total et export resteront cohérentes sous concurrence. Un DOM simulé peut représenter un dialogue sans reproduire le focus, l’inertie ou l’historique natifs. Il faut donc conserver ces contrôles comme une couche de preuve, et non leur demander de répondre à une autre question.

### 6.2.2. Les lacunes transversales conservées

Les gates Q-R1/Q-R2/Q-R3, Q-SI, Q-B1P/Q-B1F/Q-B1R/Q-B1J, Q-T2A et les vérifications UI antérieures restent ouvertes selon leurs périmètres respectifs. Le tableau n’en constitue pas un inventaire exhaustif ; il en rappelle les dépendances les plus importantes. Les projections privées authentifiées, la concurrence réelle, les transactions et le parcours CSV complet demandent notamment des preuves différentes des builds.

Une autre lacune concerne le contrat machine : les fichiers OpenAPI statiques ne décrivent pas complètement les définitions CV version 2, la date de première publication et les corrections par question. Pour ces éléments, le contrat de traitement et le domaine partagé restent les références actuelles. L’alignement de cette documentation est distinct de la validation du comportement et ne doit pas être compté deux fois.

## 6.3. Démonstration synthétique et corpus exploratoire

### 6.3.1. Cinq offres et 25 scénarios de cycle de vie

Le catalogue de démonstration organise cinq offres : un brouillon de Data Analyst, une offre Backend Engineer centrée sur la revue, une offre Senior Software Engineer avec entretiens, une offre Finance Operations Analyst sans tâches et une offre Financial Accountant dont les dépôts sont fermés. Les 25 scénarios couvrent des états reçus, bloqués, libérés, corrigés, présélectionnés, en entretien, rejetés, en proposition et embauchés [REF-EXTRACT-DEMO].

L’intérêt du catalogue est de rendre des situations difficiles à atteindre rapidement disponibles à l’inspection. Un dossier libéré montre, par exemple, une préparation distincte d’un succès d’extraction. Un dossier sans tâches permet de comprendre que le recrutement reste utilisable sans IA. Un dossier avec entretiens partiellement validés rend visible un prérequis de proposition. Une offre fermée illustre la différence entre arrêt des dépôts et poursuite des recrutements existants.

Ces dossiers sont des états déclarés. Les résultats, notifications et évaluations présemés ne racontent pas des actions réellement accomplies par les personnes représentées. Les documents sont synthétiques et proviennent de quatre profils transférés. Les réponses de fixture sont des déclarations préparées pour la démonstration, pas une vérité de référence validée indépendamment. Les métadonnées d’usage nul ou de confiance égale à un sont simulées et ne doivent jamais être intégrées à une moyenne de coût ou de qualité.

Une présentation rigoureuse annoncerait donc, pour chaque écran, la nature de ce qui est montré : état initial, transition effectivement parcourue, lecture PDF native, réponse fixture, résultat fournisseur observé ou correction humaine. L’observation du démarrage hors ligne du 13 novembre soutient une lecture native suivie d’une réponse fixture et de fichiers cache. Elle ne transforme pas les 25 scénarios en 25 extractions réelles réussies.

### 6.3.2. Une archive de laboratoire d’une autre nature

Le corpus exploratoire transféré contient 63 PDF synthétiques issus de treize familles de modèles : soixante identités numérotées, deux variantes de mise en page et un CV supplémentaire. Les 63 couples PDF/Markdown portent des informations de provenance. L’archive comprend aussi vingt couples exacts requête-réponse totalisant 102 réponses, associés à des expériences historiques [REF-EXTRACT-LAB].

Les empreintes documentent l’intégrité du transfert et la correspondance des artefacts. Elles ne prouvent pas que le Markdown restitue correctement toutes les relations du PDF, ni que les réponses sont exactes. Les six avertissements d’encodage JSume consignés sur le corpus natif sont des diagnostics de préparation, pas six erreurs sémantiques mesurées. De même, valider la forme des 102 réponses établit leur compatibilité avec leurs requêtes historiques, pas un taux de précision.

Les variantes de mise en page doivent être regroupées avec leur identité source. Les compter comme des personnes indépendantes gonflerait l’échantillon et pourrait placer le même contenu dans le réglage et dans l’évaluation. Enfin, les formulations exploratoires ont évolué : les observations archivées ne sont pas automatiquement attribuables aux questions intégrées aujourd’hui. Le catalogue de cycle de vie et ce corpus servent donc des objectifs complémentaires, sans être fusionnés en un prétendu benchmark unique.

## 6.4. Retours utilisateur : résultats positifs et limites conservées

Les retours du 8 novembre 2026 constituent une preuve d’usage partielle. Ils doivent être conservés, plutôt que remplacés par une affirmation selon laquelle rien n’aurait été vérifié. Leur formulation reste toutefois celle de chemins rapportés par l’utilisateur, pas d’une campagne indépendante comportant des assertions détaillées à chaque étape [REF-EXTRACT-STATUS].

Un parcours de candidature en attente a été déclaré fonctionnel après libération manuelle, corrections, achèvement et passage en revue figée. Le même dossier a pu suivre une présélection, une proposition explicite du propriétaire sans entretien configuré, puis une embauche distincte. Sur un parcours avec entretiens, une validation partielle bloquait la proposition ; un second recruteur ne pouvait pas finaliser à la place du propriétaire ; celui-ci pouvait enregistrer la proposition après les résultats requis. Ces observations donnent un appui concret à l’indépendance des états et à l’autorité de finalisation.

D’autres retours portent sur le rejet après échec ordinaire, le verrouillage de revue, la notification générique au candidat, l’annulation d’un rendez-vous après échec d’entretien et la replanification. La visibilité d’une notification de présélection, son retrait de la vue non lue après lecture et sa conservation dans la vue générale ont également été rapportés. Aucun de ces éléments ne démontre une isolation entre comptes ou l’ensemble des destinataires possibles ; ils attestent des chemins identifiés, avec leurs bornes.

La distinction entre inspection et transition est particulièrement importante pour les états présemés et le CSV. Plusieurs états ont été inspectés sans que leurs transitions aient été rejouées. L’utilisateur a aussi signalé une compréhension insuffisante des imports et exports, et une détection d’erreurs. Aucun aller-retour réel CSV réussi et complet n’est établi par ce seul retour. Un signalement ultérieur sur des valeurs pourtant conformes reste insuffisamment documenté pour en attribuer la cause à un ancien exemple invalide.

Les améliorations ultérieures de hiérarchie visuelle, d’identité, de filtres, de navigation et de regroupement des propositions CSV sont implémentées. Le retour initial ne doit donc pas les faire apparaître comme non réalisées. En revanche, sa date antérieure aux derniers changements empêche de l’utiliser comme acceptation de toute l’interface actuelle. La bonne continuité consiste à préserver les réussites observées, puis à cibler les différences et les risques restants plutôt qu’à déclarer une couverture totale ou à repartir artificiellement de zéro.

## 6.5. Protocole proposé d’évaluation documentaire

### 6.5.1. Définir ce que l’on cherche à mesurer

Une évaluation pertinente séparerait au moins quatre objets : préparation native, validité structurelle, justesse sémantique et utilité de revue. La préparation examine si le texte nécessaire reste disponible et correctement relié. La validité structurelle examine si les réponses sont complètes et admissibles. La justesse compare une réponse documentaire à une référence humaine pour la question exacte. L’utilité observe si l’assistance facilite réellement la recherche et la correction d’informations. Un seul pourcentage ne résumerait pas ces dimensions.

Le protocole commencerait par figer la version des questions, les catégories, la date de référence et les documents. Un sous-ensemble de réglage servirait à discuter les formulations ; un ensemble tenu à l’écart serait réservé à l’évaluation. Les variantes d’une même identité resteraient dans le même groupe. Le jeu devrait inclure des mentions absentes, des formulations ambiguës, des dates chevauchantes, des formations en cours et des situations où l’extraction est indisponible, au lieu de retenir seulement les cas faciles.

Deux personnes annoteraient indépendamment les questions à partir du PDF et de leurs critères exacts. Chacune indiquerait la réponse, la justification documentaire et, si nécessaire, l’insuffisance d’information. Les désaccords seraient conservés avant arbitrage. Cette étape distingue une erreur du système d’un besoin lui-même ambigu. Les fixtures préparées pour faire fonctionner une démonstration ne seraient pas utilisées comme références incontestées.

### 6.5.2. Définir les dénominateurs et les cas indisponibles

| Mesure proposée | Définition et intérêt | Précaution |
|---|---|---|
| Préparation exploitable | Documents dont le texte nécessaire permet l’annotation des questions | Distinguer mise en page, scan, encodage et dépassement de borne |
| Réponse structurellement valide | Réponses complètes conformes au contrat parmi les requêtes évaluées | Ne pas assimiler conformité et vérité |
| Accord par famille | Réponses identiques à la référence arbitrée pour chaque famille | Conserver les effectifs et classes rares |
| Matrice de confusion catégorielle | Répartition des confusions de niveaux ou contextes | Une catégorie proche peut rester incorrecte |
| Erreur de couverture | Différence entre compte retourné et compte de référence | Examiner aussi quels éléments ont été confondus |
| Indisponibilité | Échecs de lecture, transport, validation ou reprise | Ne pas les remplacer par faux ou zéro |
| Corrections humaines | Champs effectivement modifiés et motifs documentés | Une absence de correction ne prouve pas la justesse |

Pour une certification, la précision des réponses positives et le rappel des mentions admissibles pourraient être étudiés, à condition de publier les effectifs correspondants. Pour l’expérience ou la formation, une matrice de confusion aiderait à distinguer des erreurs de seuil de confusions plus importantes. Pour la couverture, l’écart de compte serait accompagné d’une analyse des termes : un compte correct peut masquer un élément omis et un élément ajouté à tort.

Les échecs seraient rapportés à part, puis réintégrés dans une lecture de service complet. Évaluer seulement les réponses disponibles donnerait une vision trop favorable d’un système qui échouerait sur les documents difficiles. À l’inverse, traiter toute indisponibilité comme une erreur sémantique cacherait la cause à corriger. La confiance brute pourrait être confrontée à l’accord humain dans une étude ultérieure ; aucun seuil ni calibration n’est actuellement validé.

### 6.5.3. Examiner l’utilité sans fabriquer un gain

Une étude d’utilité comparerait des tâches de recherche d’information avec et sans assistance, sur des dossiers d’une difficulté comparable et avec un ordre contrebalancé. Elle observerait le temps de recherche, le nombre de retours au PDF, les corrections et les erreurs résiduelles, sans transformer la vitesse en seul objectif. Les mêmes personnes ne devraient pas relire immédiatement le même CV dans les deux conditions, au risque de mesurer la mémoire du premier passage.

Ce protocole n’est pas exécuté. Il précise ce qu’exigerait une affirmation de gain de temps ou de qualité ; il ne promet ni effectif, ni seuil de réussite, ni résultat. Sa réalisation éventuelle demanderait un accord sur les documents, les participants et les appels réels autorisés.

## 6.6. Protocole proposé de coût, latence et reprise

### 6.6.1. Instrumenter des phases plutôt qu’une durée unique

Une mesure future distinguerait les instants de dépôt validé, acquisition du travail, début et fin de lecture, consultation des caches, admission, transport, validation, écriture de cache et règlement en base. Le délai HTTP du candidat resterait séparé du délai jusqu’au résultat disponible. Le rythme de balayage de cinq secondes ne serait pas utilisé comme approximation de la latence d’extraction.

Les observations seraient classées par mode et état de cache : fixture ou réel, cache de lecture froid ou chaud, cache de réponse absent ou présent, reprise locale seule. Une réponse réutilisée conserverait son identité d’usage originale et ne compterait pas comme une nouvelle facturation. Les échecs et envois incertains seraient comptés, même sans résultat final. Sans ces distinctions, une moyenne pourrait mélanger un transport distant avec une simple lecture de fichier et ne plus décrire aucun chemin réel.

Le coût d’entrée dérivé utiliserait les unités effectivement documentées. L’illustration autorisée demeure : 5 000 tokens d’entrée complets à 0,05 USD par million donnent 0,00025 USD, soit 0,025 cent US ; mille documents avec un seul extracteur donnent 0,25 USD d’entrée uniquement. Les essais individuels rapportés par l’utilisateur ne constituent pas un lot mesuré. La facturation des sorties ou autres composantes reste à établir selon les conditions réelles de Jev, sans supposer une génération de sortie facturée [REF-EXTRACT-COST].

### 6.6.2. Vérifier la reprise sans la confondre avec un succès nominal

La question opérationnelle la plus sensible concerne les ruptures entre envoi, cache et persistance. Un protocole de panne devrait examiner séparément un arrêt avant la frontière durable, une interruption après `send_started`, un succès mis en cache avant règlement, un accusé de commit perdu, une entrée corrompue et une clôture métier pendant l’exécution. Chaque cas aurait un résultat attendu explicite : transport interdit ou autorisé, résultat local récupérable ou indisponible, absence d’écriture tardive et maintien de l’historique de tentative.

Ces scénarios ne nécessitent pas tous un appel payant pour être étudiés, mais leur préparation et leur exécution restent des opérations distinctes à autoriser. Les modèles historiques ne valent pas acceptation PostgreSQL/Redis/HTTP de la version finale. En particulier, l’ordre cache-avant-règlement et la reprise exclusivement locale après un envoi connu sont des mécanismes implémentés, pas une garantie vérifiée contre toutes les courses [REF-EXTRACT-SAFETY].

L’analyse devrait également conserver les cas où le choix conservateur réduit la disponibilité : une réponse externe peut être perdue sans autoriser de nouvel envoi. Ce blocage n’est pas un résultat réussi, mais il peut correspondre à la politique recherchée de maîtrise de dépense. La libération manuelle fournit alors une issue applicative explicite. Aucun protocole de ce chapitre n’autorise à renouveler les compteurs ou à contourner une limite.

## 6.7. Menaces à la validité et limites du prototype

La première menace est la représentativité. Les documents disponibles sont synthétiques, les formulations ont été choisies et certaines mises en page dérivent d’une même identité. La variété visuelle ne garantit pas une variété sémantique équivalente. Une bonne réponse sur ces dossiers ne démontrerait pas une performance identique sur des parcours professionnels réels, des formulations lacunaires ou d’autres langues. Les scans restent hors du chemin natif livré.

La deuxième menace concerne la référence. Les réponses déclarées du catalogue ne résultent pas d’une annotation indépendante. Les observations de laboratoire établissent une sortie historique, pas une vérité. Les résultats de questions anciennes ne se transfèrent pas automatiquement à une formulation actuelle. Une évaluation devrait donc porter sur la configuration exacte, conserver ses désaccords et éviter tout ajustement guidé par l’ensemble censé rester indépendant.

La troisième menace vient de l’environnement. Le lancement local et les contrôles simulés ne décrivent pas une exploitation prolongée ou multi-utilisateur. Les quotas et la rétention automatique des caches, la réconciliation globale du stockage privé et les comportements Windows restent incomplets ou non vérifiés selon leur périmètre. Les garanties de permission doivent aussi être testées à travers les vraies sessions et les projections HTTP, et non seulement par lecture de conditions de service.

La quatrième menace concerne l’interprétation humaine. Une valeur typée et présentée proprement peut sembler plus certaine qu’elle ne l’est. La confiance brute peut renforcer cet effet sans calibration. La consultation du PDF et les corrections par champ réduisent l’opacité, mais ne démontrent pas que chaque recruteur exercera une vérification suffisante. Une étude d’usage devrait rechercher les erreurs non corrigées et l’effet d’ancrage, pas seulement le nombre de champs sauvegardés.

Enfin, ni la justesse d’une extraction ni la présence d’un humain ne suffisent à établir l’équité d’un recrutement, la pertinence de ses critères ou une conformité juridique. Ces questions demandent un contexte de déploiement et une analyse distincts. Le prototype peut être discuté comme une contribution technique limitée, sans transformer cette limite en exemption ou en conclusion de conformité.

## 6.8. Bilan critique : valeur produite et acceptation restante

| Contribution | Réalisé dans les sources | Appui observé | Question encore ouverte |
|---|---|---|---|
| Recrutement sans dépendance obligatoire à l’IA | Définitions sans tâches, états séparés, décisions explicites | Parcours sans entretiens rapporté le 8 novembre | Matrice complète d’autorité et courses |
| Revue contrôlable | Original distinct, correction par question, effectif et clôtures | Revue/libération/correction rapportées sur un chemin antérieur | Contrat CV actuel, isolation authentifiée et conflits réels |
| Préparation documentaire locale | Lecteur natif borné, diagnostics et cache privé | Lectures ciblées et une tâche fixture native au démarrage | Robustesse représentative et sémantique |
| Exécution économique prudente | Requête multi-question, passerelle, registre et reprise cache-only | Builds et démarrage restreint consignés | Pannes, accusés ambigus et concurrence de la version finale |
| Interopérabilité | Exports effectifs, import de décisions confirmé distinct des corrections | Contrôles ciblés et inspection utilisateur partielle | Aller-retour authentifié, parité des filtres et rollback |
| Démonstration structurée | Catalogue de cinq offres/25 scénarios | Initialisation et préparation locales observées | Répétabilité complète et transitions authentifiées |

La valeur du projet est d’abord organisationnelle et technique : réunir dossiers et étapes, rendre les responsabilités lisibles, préserver la provenance d’une information et permettre une assistance désactivable. Le résultat n’est pas un classement automatique plus performant qu’un recruteur. Il fournit un cadre où les informations proposées peuvent être confrontées à leur source et où une décision reste une commande humaine distincte.

Les vérifications prioritaires sont celles qui traversent plusieurs frontières : autorisation et document privé, décision et écriture tardive, cache et connaissance d’envoi, liste et export, brouillon local et conflit serveur. Elles conditionnent l’acceptation de mécanismes déjà implémentés. Les extensions telles qu’OCR, nouveaux extracteurs ou connecteurs ne remplacent pas cette consolidation ; elles constituent d’autres périmètres à justifier ultérieurement.

## Conclusion du chapitre

Les preuves disponibles établissent des réalisations de source, des contrôles ciblés historiques et une préparation locale observée. Elles incluent des retours positifs sur plusieurs parcours humains, sans former une acceptation complète de la version actuelle. Elles ne fournissent ni précision IA représentative, ni gain de temps, ni coût complet observé, ni garantie expérimentale de reprise payante sous panne.

Cette conclusion ne réduit pas le travail à ses manques : les règles et les mécanismes livrés donnent une base concrète à l’évaluation. Elle fixe simplement la frontière entre contribution réalisée et performance démontrée. Le prolongement le plus solide consiste à exécuter, dans un périmètre ultérieurement autorisé, les vérifications transversales et les protocoles proposés, tout en conservant les distinctions de provenance qui rendent déjà le prototype discutable et contrôlable.
