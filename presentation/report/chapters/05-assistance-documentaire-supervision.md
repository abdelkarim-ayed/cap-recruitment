# Chapitre 5 — Assistance documentaire facultative et supervision humaine

## Introduction

La lecture d’un curriculum vitæ met en relation des informations hétérogènes : diplômes, périodes d’activité, certifications, technologies citées et descriptions de projets. Certaines informations sont explicites ; d’autres exigent une interprétation que le document ne permet pas toujours de stabiliser. Une plateforme de recrutement peut faciliter leur consultation sans prétendre établir la compétence réelle d’une personne. C’est cette position intermédiaire que retient le prototype : produire des réponses documentaires structurées, puis permettre leur inspection et leur correction par les ressources humaines, sans déclencher de décision de recrutement.

Le sous-système étudié transforme un PDF privé en texte Markdown par un traitement natif local. Il construit ensuite une requête Jev contenant les questions configurées pour un extracteur, valide la réponse complète et conserve un résultat original immuable. Une couche distincte porte les corrections humaines. Les valeurs effectives utilisées dans les exports résultent de cette combinaison explicite, et non d’une réécriture silencieuse de la sortie initiale [REF-EXTRACT-CONTRACT].

L’intérêt technique ne réside donc pas uniquement dans l’appel à un fournisseur. Il se situe dans la continuité entre définition métier, préparation documentaire, exécution différée, maîtrise des tentatives, interprétation des résultats et autorité humaine. Ce chapitre expose ces mécanismes, leurs compromis et leur portée. Les propriétés décrites sont celles du contrat et des sources au 13 novembre 2026 ; les observations d’exécution et les vérifications encore ouvertes sont examinées au chapitre suivant.

## 5.1. Une assistance circonscrite à l’information documentaire

### 5.1.1. Questionner le document plutôt que noter la personne

Une question d’extraction porte sur ce que le CV énonce ou permet de documenter dans un périmètre défini. Demander si une certification est mentionnée comme obtenue n’équivaut pas à vérifier son authenticité. Identifier un usage professionnel explicite d’une technologie n’équivaut pas à mesurer la maîtrise de cette technologie. De même, compter les éléments d’une liste retrouvés dans le texte ne produit pas un score d’adéquation au poste. Le choix de ces formulations réduit l’ambiguïté de l’usage attendu et rend les résultats plus faciles à discuter.

Cette frontière est inscrite dans le modèle de configuration. La définition de traitement de version 2 contient des tâches de type `cvExtractor`, chacune reliée à un champ documentaire par `sourceInputId`. Elle ne contient ni consigne libre rédigée par un recruteur à destination du fournisseur, ni règle de classement, ni commande de présélection. Le registre partagé n’enregistre actuellement que l’extracteur CV. Une configuration peut contenir zéro tâche : l’existence d’une candidature ne dépend donc pas de l’activation de l’assistance [REF-EXTRACT-REGISTRY].

Un champ documentaire ne peut alimenter qu’un extracteur dans la même définition. Chaque tâche dispose d’une identité stable et d’une clé de sortie distincte. Les questions possèdent également leurs propres identifiants, uniques et sensibles à la casse. Ces identités assurent le raccordement entre configuration, réponse, correction et colonne d’export. Modifier un libellé d’affichage ne doit pas être confondu avec renommer une donnée déjà enregistrée.

### 5.1.2. Conserver une référence temporelle intelligible

Certaines réponses dépendent d’une date : durée d’expérience à considérer ou formation attendue dans une fenêtre future. Utiliser la date d’exécution introduirait une variation artificielle entre deux candidatures traitées à des moments différents. Le prototype retient la date UTC de première publication réussie de l’offre. Cette date est enregistrée après les deux contrôles de révision de la publication, puis portée par l’instantané de candidature. Un traitement retardé ou une reprise ne la déplace pas [REF-EXTRACT-CONTRACT].

La prévisualisation d’un brouillon utilise provisoirement la date courante, avec une indication de ce caractère provisoire. En production de résultats, aucune substitution silencieuse par « aujourd’hui » n’est admise. Le lecteur peut ainsi reconstruire la question réellement posée. Cette stabilité est particulièrement importante pour une formation en cours : un niveau admissible dans une fenêtre de quelques mois ne doit pas être présenté comme un diplôme déjà délivré.

Enfin, les résultats d’extraction restent privés à la revue RH. Les projections destinées au candidat et à l’interviewer omettent les réponses, les corrections et les métadonnées internes de préparation. La séparation des vues réduit l’exposition, mais son effectivité complète doit encore être vérifiée dans des parcours authentifiés ; l’intention de confidentialité ne vaut pas preuve d’isolation.

## 5.2. Du PDF privé au Markdown natif

### 5.2.1. Pourquoi exploiter la couche texte

Le chemin retenu exploite le texte contenu dans le PDF, sans convertir systématiquement les pages en images. Ce choix utilise une ressource déjà disponible lorsque le document a été généré par un traitement de texte ou un outil de composition. Le Markdown constitue une représentation intermédiaire consultable, transportable et adaptée à la construction d’une requête textuelle. Le calcul de lecture reste local, sur CPU, et le fournisseur reçoit cette représentation plutôt que les pages du document par défaut.

Il ne s’agit pas d’un OCR. Un PDF numérisé peut contenir uniquement des images, ou une couche texte partielle sans correspondance satisfaisante avec la lecture visuelle. Le traitement natif ne permet pas de reconstruire l’information absente de cette couche. Le dépôt peut accepter un fichier DOCX suivant les règles de formulaire, mais cette acceptation ne signifie pas que le lecteur d’extraction sait l’interpréter. Le chemin réel de préparation étudié ici est limité au PDF [REF-EXTRACT-CONTRACT].

[[FIG:DIA-05]]

*Figure — Chaîne documentaire : PDF privé, lecture native, requête multi-question, validation et revue. La vue décrit les responsabilités ; elle ne représente pas un résultat de performance.*

### 5.2.2. Isolation et bornes opérationnelles

La bibliothèque `pdf-inspector@1.25.2` est appelée au moyen de ses liaisons natives asynchrones dans un processus enfant dépourvu de credential. Le processus peut être interrompu. Les bornes documentées sont de 10 Mio pour le fichier PDF, vingt pages, 60 000 caractères de Markdown, huit secondes de traitement, 192 Mio de tas V8 et 64 Kio de diagnostics. Ces limites évitent de laisser une préparation documentaire occuper indéfiniment le chemin de traitement.

Chaque borne traite un risque différent. La taille du fichier limite le volume manipulé ; le nombre de pages borne la complexité documentaire ; le nombre de caractères borne le texte préparé ; le délai permet d’interrompre une opération trop longue. La limite de tas concerne V8, pas toutes les allocations natives de la bibliothèque. Elle ne constitue donc pas un bac à sable mémoire imposé par le système d’exploitation. Présenter cette isolation comme une frontière de sécurité absolue serait excessif.

Le texte vide ou incomplet provoque un échec explicite. Le système ne tronque pas silencieusement le document pour obtenir une réponse apparemment complète. Ce choix est cohérent avec la sémantique des questions : une certification absente d’un texte tronqué ne peut pas être assimilée à une certification non mentionnée dans le CV. L’échec conserve ainsi son caractère opérationnel au lieu de devenir une réponse métier négative.

### 5.2.3. Lire les diagnostics sans inventer un indicateur de qualité

Des problèmes d’encodage, de CMap ou d’ordre de lecture peuvent altérer la représentation textuelle. Les colonnes, tableaux et blocs indépendants sont particulièrement sensibles à la différence entre ordre graphique et ordre des objets internes du PDF. Un nom de technologie peut rester lisible alors que son lien avec une période d’emploi disparaît. Une extraction lexicalement plausible peut donc rester sémantiquement ambiguë.

Les avertissements sont conservés comme diagnostics. Ils ne sont ni une note calibrée de qualité, ni une justification pour remplir automatiquement les réponses par « non mentionné ». Un avertissement ne signifie pas non plus que toutes les réponses seraient fausses. Il fournit une information de contexte que l’évaluation future devra confronter à des annotations humaines. Le système ne dispose actuellement d’aucun secours OCR ou hébergé automatique ; cette absence maintient une limite explicite plutôt qu’une seconde chaîne implicite de coût et de transfert.

## 5.3. Les cinq familles de questions

Le domaine partagé définit cinq familles, dont les formulations et catégories sont possédées par le code. Plusieurs questions peuvent appartenir à la même famille. Leur nombre n’est pas le nombre d’appels : toutes les questions d’un extracteur sont réunies dans une même requête. Le tableau suivant synthétise les valeurs normalisées ; les critères complets restent attachés à la question présentée en revue [REF-EXTRACT-DOMAIN].

| Famille | Résultat normalisé | Interprétation centrale |
|---|---|---|
| Formation | Catégorie de niveau, dont `not_stated` | Niveau documenté dans le périmètre et la fenêtre demandés |
| Certification | Booléen | Mention comme détenue ou achevée, non validité externe |
| Expérience | Tranche de durée | Temps de travail documenté, chevauchements comptés une fois |
| Couverture de liste | Entier entre zéro et la taille de la liste | Nombre d’éléments explicitement mentionnés ou décrits sans ambiguïté |
| Preuve de compétence | Catégorie de contexte | Mention, étude, application non professionnelle ou usage professionnel explicite |

### 5.3.1. Formation et fenêtre d’achèvement

La famille `education_level` recherche le niveau le plus élevé correspondant au périmètre demandé. Les catégories distinguent secondaire ou inférieur, formation professionnelle ou technique, cycle supérieur court, bachelor, master, doctorat et absence de niveau admissible déclaré. Un périmètre peut être une chaîne ou une liste d’alternatives, reliées dans la question par une logique « ou ». La configuration peut aussi préciser une fenêtre d’achèvement attendue, exprimée en mois après la date de référence.

La formulation précise qu’une formation en cours n’est pas présumée achevée. Lorsqu’une fenêtre est fournie et effectivement retenue dans la formulation, une échéance explicitement attendue peut être admissible. Cela ne crée pas un champ distinct « diplôme obtenu ». La revue doit donc conserver la question et sa fenêtre, plutôt que réduire le résultat à un libellé de niveau hors contexte. Cette précision est utile, par exemple, pour distinguer un master déjà terminé d’un master dont l’achèvement déclaré entre dans la période demandée.

### 5.3.2. Certification et termes acceptés

La famille `certification` pose une question sur une certification déterminée. La préparation, les études prévues ou une activité connexe ne suffisent pas ; le CV doit la présenter comme détenue ou achevée. La réponse catégorielle du fournisseur est normalisée en booléen. `false` signifie ici « non documentée comme détenue ou achevée », et non « la personne ne la possède certainement pas ». Aucun contrôle d’expiration, de numéro de certificat ou de registre émetteur n’est inclus.

Une certification ou une compétence peut être définie par une chaîne, ou par un nom accompagné d’alias acceptés. Ces alias sont directionnels : ils indiquent ce qui peut être accepté pour la question courante. Ils ne construisent pas un dictionnaire symétrique universel. Accepter un nom abrégé pour un produit donné n’autorise pas à remplacer automatiquement tout terme voisin par ce produit dans les autres questions. Le maintien des termes exacts évite une normalisation qui élargirait discrètement le sens du besoin.

### 5.3.3. Expérience : durée documentée, pas comptage d’années civiles

La famille `experience_years` utilise les tranches « moins d’un an », « un à moins de trois ans », « trois à moins de cinq ans », « cinq à moins de huit ans » et « huit ans ou plus ». La question demande de compter le temps écoulé, et non le nombre d’années civiles traversées. Deux expériences simultanées ne doivent pas être additionnées comme deux durées indépendantes. Un périmètre facultatif peut restreindre l’expérience recherchée.

Le texte interdit également de déduire qu’une compétence listée a été utilisée pendant toute la durée d’un poste voisin. Cette réserve traite un problème fréquent de liaison entre rubriques : la proximité typographique ne prouve pas une relation temporelle. La première tranche inclut le cas où aucune durée n’est étayée. Elle ne correspond donc pas à une mesure exacte de zéro année ; cette perte de détail est un compromis de la catégorisation actuelle, à considérer lors de la lecture des exports.

### 5.3.4. Couverture et contexte d’utilisation

La famille `skill_coverage` compte une seule fois chaque élément fourni. Sa liste comporte de un à 254 éléments ; le résultat doit être un entier compris entre zéro et la longueur de cette liste. Une catégorie générique ou une activité apparentée ne prouve pas la présence d’un produit particulier. Le résultat constitue une couverture documentaire, sans pondération ni seuil de recrutement. Comparer deux comptes n’a de sens qu’en conservant la liste effectivement demandée.

La famille `skill_evidence` examine un seul élément et distingue `not_mentioned`, `stated_or_studied`, `applied` et `used_professionally`. Une ligne de compétences correspond au plus à une déclaration sans exemple concret ; une application dans un projet scolaire ou personnel n’est pas un usage professionnel. Le niveau le plus élevé décrit le contexte explicite de la preuve documentaire. Il ne signifie pas « expert ». Cette distinction empêche de convertir une catégorie pratique pour la revue en évaluation psychométrique ou professionnelle non réalisée.

## 5.4. Requête multi-question et validation complète

### 5.4.1. Une unité d’exécution cohérente

La construction de requête commence par la validation des arguments de l’extracteur, du Markdown non vide, de la date ISO et du modèle résolu. L’objet produit contient le modèle, un état avec le CV et la date de référence, ainsi qu’un dictionnaire de questions indexées par leurs identifiants. Chaque entrée de type `choice` contient des instructions et les critères de ses catégories. Les clauses facultatives ne sont ajoutées que si elles sont configurées [REF-EXTRACT-DOMAIN].

Cette construction centralisée évite que la prévisualisation, le transport et la revue fabriquent chacun une variante de la question. Le sens dépend autant des critères que du titre. Pour une certification, les catégories expliquent ce qui compte comme achevé ; pour une expérience, les instructions règlent le chevauchement ; pour une couverture, les catégories possibles sont générées à partir de la taille de liste. Conserver ces éléments permet d’examiner ce qui a réellement été demandé.

Une offre comportant un extracteur CV et dix questions entraîne une requête multi-question, pas dix requêtes. La présence des cinq familles n’entraîne pas cinq appels. Plusieurs extracteurs configurés sur des sources documentaires différentes constituent en revanche plusieurs unités d’exécution. Le regroupement partage le même contexte et réduit le nombre d’échanges, mais agrandit la requête et l’unité d’échec : une réponse incomplète ne permet pas de déclarer l’extracteur partiellement réussi.

### 5.4.2. Type valide et information vraie : deux problèmes distincts

La validation exige une correspondance complète avec les identifiants attendus et des valeurs admissibles pour chaque famille. Les comptes sont bornés par la liste configurée ; les catégories doivent appartenir à l’énumération attendue ; les certifications sont converties à partir des choix prévus. Une réponse mal formée échoue pour l’ensemble de l’extracteur. Elle ne devient ni un booléen faux, ni un compte nul, ni une non-mention de substitution.

Un succès conserve une structure normalisée `{version:1, fields, rawResponse}`. Les champs facilitent l’affichage et les exports. L’enveloppe brute conserve les choix, distributions, informations de confiance, modèle et métadonnées d’usage reçus. Ces données restent distinctes de la correction humaine. Aucun seuil de confiance ne transforme automatiquement une réponse en décision, et aucune modification cosmétique des probabilités n’est utilisée pour leur donner une apparence plus certaine [REF-EXTRACT-CONTRACT].

La validation structurelle établit que le résultat est exploitable par le logiciel, pas qu’il interprète correctement le CV. Une distribution fortement concentrée peut accompagner une erreur de liaison entre deux rubriques. Une confiance fournie par le service ne constitue pas une probabilité de justesse calibrée sur les CV de ce projet. Pour l’établir, il faudrait des références humaines, des cas indépendants et une étude spécifique. Le maintien des informations originales permet cette analyse future sans la présumer réalisée.

## 5.5. Traitement différé, baux et clôtures

### 5.5.1. Découpler dépôt et extraction

La transaction de dépôt enregistre la candidature et les tâches en attente avant de signaler le travail à traiter. La requête HTTP du candidat n’attend ni le lecteur PDF ni Jev. Un signal mémoire borné facilite le réveil du worker, mais la base demeure la source des travaux persistants. Des balayages périodiques récupèrent les signaux manqués ou débordants. Le contrat décrit une file mémoire limitée à 128 identifiants et un balayage toutes les cinq secondes dans les modes de runner explicites.

Cette combinaison évite d’imposer une infrastructure générique de workflow pour le périmètre actuel. Elle introduit cependant une attente entre dépôt et disponibilité des résultats. Les cinq secondes constituent un rythme de balayage, pas une promesse de délai final : la durée dépend aussi des travaux précédents, de la lecture, des admissions, du fournisseur et de la persistance. Une indisponibilité du dépôt de données reporte le travail au prochain balayage plutôt que déclencher une boucle rapide.

[[FIG:RPT-SEQUENCE]]

*Figure — Séquence du dépôt à la persistance : commit, réveil indicatif, acquisition du travail, lecture, contrôle de tentative, cache puis règlement. Les branches de reprise locale ne comportent pas de nouvel appel payant.*

### 5.5.2. Un bail ne confère pas une autorité permanente

Le worker acquiert une candidature à l’aide d’un bail et d’un jeton. Ces mécanismes identifient l’invocation autorisée à travailler et permettent de détecter un propriétaire périmé. Le runner traite une candidature à la fois par processus API, avec des requêtes d’extracteurs sérielles ; les acquisitions en base restent nécessaires lorsque plusieurs processus existent. Les différentes tâches d’une candidature peuvent être réglées indépendamment. Une tâche ayant déjà réussi n’est pas rejouée.

Entre acquisition et écriture, l’état métier peut évoluer. Une libération manuelle, une revue terminée ou une présélection peuvent rendre le résultat tardif inéligible. Les contrôles de clôture et le jeton doivent donc être réévalués à la persistance. La connaissance d’un ancien bail ne suffit pas pour écrire. Cette règle protège les résultats applicatifs ; elle n’interrompt pas nécessairement un calcul déjà admis chez le fournisseur.

### 5.5.3. Réessayer seulement ce qui peut l’être

Les erreurs ne partagent pas la même politique. Une indisponibilité transitoire démontrée avant envoi peut permettre une nouvelle tentative différée de l’extracteur entier. Pour le mode réel, le contrat retient douze heures de délai et au maximum trois tentatives ou frontières d’envoi selon le cas documenté. Les erreurs de budget, de configuration ou de contenu ne bouclent pas. Un refus fournisseur connu de type 429 est terminal dans la politique conservatrice initiale ; un envoi ambigu ne devient jamais une tentative « sûrement non envoyée ».

Les modes désactivé, fixture, `offline-demo` et `jev` restent explicites. Les fixtures ne basculent pas vers un fournisseur si une réponse manque. Le mode réel local approuvé vise uniquement les nouvelles soumissions synthétiques après une borne UTC fixe ; les anciennes tâches ne sont pas drainées. Un détenteur de credential vide laisse les travaux réels non liés sans acquisition. La configuration source fournit ces barrières, mais le chapitre de vérification montrera pourquoi elle ne constitue pas encore une validation de bout en bout de la reprise concurrente.

## 5.6. Passerelle, caches et connaissance durable des envois

### 5.6.1. Une frontière unique vers le fournisseur

`JevGateway` porte la sérialisation, les admissions et le transport. Le sous-système métier ne dispose pas d’un second accès direct destiné à contourner un refus. Les contrôles documentés limitent l’activité à un appel actif, trois admissions par minute et vingt admissions persistantes au total dans l’espace de compteurs prévu. Les admissions échouées ou incertaines consomment l’allocation. Un délai HTTP, des tailles de requête et de réponse et l’absence de redirection ou de nouvelle tentative cachée complètent cette politique [REF-EXTRACT-SAFETY].

Ces nombres sont des limites du dispositif de développement et de démonstration, pas une capacité de production ni un budget monétaire calculé. Le plafond global de dépense autorisé ne devient pas un objectif à consommer. La distinction est essentielle : compter les admissions ne suffit pas à calculer une facture, et une admission n’atteste pas un résultat utile. Un refus doit arrêter le chemin concerné plutôt qu’inciter à changer de credential ou d’espace de compteurs.

Le secret est détenu en mémoire et chargé par l’utilisateur au moyen d’un canal local restreint. Le backend démarre sans clé ; la rotation ne change ni le consentement d’exécution ni les limites. Le point de contrôle local est acquis avant les hooks du worker, et un second backend rencontrant un état occupé refuse le démarrage. Ces mécanismes réduisent les risques de mauvaise cible et de duplication de processus sans transformer le canal local en preuve d’une rotation réussie sur toutes les plateformes.

### 5.6.2. Deux caches, deux identités

Le cache de préparation est indexé par l’empreinte du PDF, la version du lecteur et ses options. Il conserve la représentation préparée et les diagnostics utiles. Le cache de réponse est indexé par les octets de la requête effective complète : Markdown réel, date de publication, modèle, ordre des questions, ordre des choix et termes acceptés. Deux documents identiques associés à des questions différentes ne constituent donc pas la même requête. Une simple identité de candidat ou de fichier serait insuffisante.

Les caches sont des fichiers privés, avec répertoires et fichiers à permissions restrictives, écritures temporaires exclusives puis renommage atomique. Une entrée est bornée à 2 Mio. Les réponses de fixture et les réponses réelles occupent des répertoires séparés. Les correspondances exactes et la forme complète sont vérifiées à la lecture ; une entrée corrompue est traitée comme manquante. L’autorisation et l’éligibilité courantes précèdent toujours la réutilisation [REF-EXTRACT-CONTRACT].

Ces fichiers persistent après un redémarrage, contrairement à un cache mémoire seul. Ils contiennent toutefois des données privées dérivées et demandent de l’espace disque. Aucune politique automatique globale de quota ou de rétention n’est encore livrée. L’atomicité d’une entrée ne résout ni la conservation à long terme ni la réconciliation de tous les objets privés. La présence d’un cache ne dispense pas de documenter son exploitation.

### 5.6.3. Le cache ne remplace pas le registre de tentative

Le registre `cv_request_attempts` coordonne durablement le couple mode et empreinte de requête. Il conserve une connaissance d’envoi, pas le texte du CV ou la réponse complète. Une frontière durable `send_started` doit être confirmée avant le transport. Une interruption après cette frontière peut laisser l’issue externe inconnue. Dans ce cas, l’absence de réponse locale n’autorise pas à supposer que le fournisseur n’a rien reçu.

[[FIG:RPT-STATES]]

*Figure — États de connaissance d’une tentative : avant envoi démontrable, frontière durable, réponse validée ou issue incertaine. Le diagramme distingue reprise locale et autorisation d’un nouveau transport.*

Le résultat validé est écrit au cache fichier avant le règlement du succès en base. Si l’accusé de persistance est perdu ou si l’écriture de tâche échoue, le bail reste présent. Après expiration, une invocation interrompue disposant d’un historique durable peut reconstruire la même requête et chercher exclusivement un succès validé en cache. Elle ne peut ni admettre un nouvel appel ni renouveler les compteurs. Un cache absent ou invalide conduit à une indisponibilité, et non à un repli payant.

Cette stratégie traite séparément connaissance de dépense et disponibilité du résultat. Elle privilégie le refus d’une dépense potentiellement dupliquée, au prix d’un blocage possible lorsque la réponse est perdue. Les clôtures métier s’appliquent également à ce rejeu local. L’ordre cache-avant-règlement et les gardes durables sont implémentés dans les sources ; leur comportement sous pannes réelles, concurrence PostgreSQL/Redis et accusés ambigus n’est pas une garantie expérimentalement vérifiée à ce stade.

## 5.7. Frugalité : calcul explicite et coût total

### 5.7.1. Définir l’unité avant de multiplier

L’unité économique pertinente est la requête effectivement admise pour un extracteur documentaire. Le nombre de familles n’est pas un multiplicateur. Le nombre de questions influence la taille du contexte, mais pas directement le nombre d’appels tant qu’elles appartiennent au même extracteur. Le cache peut éviter certains appels, tandis qu’une tentative interrompue peut consommer une admission sans produire de résultat utilisable. Le nombre de documents ne suffit donc pas, à lui seul, à reconstituer une dépense.

L’utilisateur rapporte des essais individuels sur des CV variés dont les requêtes complètes comportaient au plus 5 000 tokens d’entrée. Cette indication inclut le texte documentaire et l’ensemble de la requête ; il ne faut pas ajouter une seconde fois une enveloppe supposée. Elle ne provient pas d’une évaluation par lots et n’établit ni une moyenne représentative ni une borne applicable à tout futur document. Le calcul suivant est une illustration fondée sur cette indication et sur un prix d’entrée supposé de 0,05 USD par million de tokens [REF-EXTRACT-COST].

Pour une requête, `C_entrée = T_entrée × P_entrée / 1 000 000`. Avec 5 000 tokens, `C_entrée = 5 000 × 0,05 / 1 000 000 = 0,00025 USD`, soit `0,025 cent US`. Pour mille documents avec un seul extracteur et une requête de cette taille chacun, le coût d’entrée dérivé est de `0,25 USD`. Ce sont uniquement des coûts d’entrée hypothétiques, sans facture observée.

| Projection arithmétique | Hypothèse d’entrée totale | Part d’entrée hypothétique |
|---|---:|---:|
| Une requête | 5 000 tokens | 0,00025 USD |
| Cent documents, un extracteur chacun | 500 000 tokens | 0,025 USD |
| Mille documents, un extracteur chacun | 5 000 000 tokens | 0,25 USD |

### 5.7.2. Ne pas inventer la facturation des sorties

Une API de réponses catégorielles ne doit pas être tarifée dans le rapport par analogie automatique avec une API de génération de texte. La présence d’un résultat, d’une distribution ou d’un champ d’usage ne démontre pas que des tokens de sortie sont facturés séparément, ni à quel prix. Les conditions effectives de facturation de Jev pour ce cas ne sont pas établies par les pièces retenues. La composante correspondante reste donc inconnue, et n’est ni ajoutée fictivement ni fixée implicitement à zéro.

Une expression plus prudente est `C_fournisseur = C_entrée + C_autres_composantes_contractuelles`. Si le contrat applicable définit des unités de sortie facturées, leur volume et leur prix doivent être utilisés. S’il définit une autre unité, c’est cette unité qu’il faut retenir. Les minimums, engagements ou taxes éventuels ne peuvent être renseignés sans documentation pertinente. Aucune hypothèse de doublement par les sorties n’est nécessaire pour expliquer le mécanisme actuel.

### 5.7.3. Local n’est pas gratuit, faible coût n’est pas utilité démontrée

La lecture native, les caches, PostgreSQL et l’interface ne consomment pas directement de tokens fournisseur. Ils mobilisent néanmoins CPU, mémoire, disque, énergie, maintenance et temps d’exploitation. Le développement, l’examen des dossiers et les corrections ont aussi un coût. Sans comptabilité ou mesure dédiée, le rapport ne peut désigner un poste dominant ni conclure que l’ensemble du dispositif serait moins coûteux qu’une solution commerciale complète.

Une comparaison loyale devrait aligner les périmètres : formats supportés, OCR éventuel, normalisation, langues, engagements de service, exploitation, revue humaine et unité de facturation. Un tarif générique par page de traitement documentaire ne devient pas automatiquement un tarif de parsing de CV. Les montants commerciaux non établis et les rapports de supériorité correspondants sont donc écartés. La contribution économique défendable est une méthode de calcul transparente et une architecture qui limite les envois, non une économie de marché mesurée.

La même prudence s’applique à la latence. Un cache valide peut supprimer une préparation ou un transport, et le regroupement évite plusieurs échanges indépendants ; aucune durée moyenne n’en découle sans mesure. Le temps jusqu’à une information utile comprend attente, lecture, admission, fournisseur, validation, persistance et revue. Réduire une seule composante ne démontre pas une réduction équivalente du travail du recruteur.

## 5.8. Original, correction indépendante et valeur effective

### 5.8.1. Une filiation lisible par champ

Un résultat réussi est conservé comme original immuable. La correction n’écrase ni le champ initial ni la réponse brute. Elle est rattachée au triplet candidature, tâche et question, avec auteur et date. Cette granularité permet de corriger une formation sans modifier un compte de couverture voisin. La vue RH conserve la question, sa configuration, l’original, l’effectif, la source et la présence éventuelle d’une correction [REF-EXTRACT-CONTRACT].

[[FIG:DIA-07]]

*Figure — Filiation d’un champ : résultat original et correction indépendante produisent une valeur effective. La structure n’est pas un journal exhaustif de toutes les éditions historiques.*

La règle est simple : si une correction existe, sa valeur prévaut ; sinon, l’original est utilisé. La présence de correction est un fait distinct de l’égalité des valeurs. Une personne peut confirmer une valeur identique à celle de la machine : le résultat effectif ne change pas, mais la provenance humaine existe. Inversement, retirer cette correction rétablit la provenance de l’original, même si la valeur affichée reste identique. Comparer seulement les valeurs effectives ferait perdre cette distinction.

### 5.8.2. Absence, null et retrait ne sont pas synonymes

Dans une requête de modification, une question absente signifie « conserver son état actuel ». Une correction de valeur `null` signifie « inconnu après revue » et doit prévaloir sur une valeur machine disponible. Le couple `remove:true` et `value:null` demande le retrait de la surcharge, donc le retour à l’original lorsqu’il existe. `false` et zéro sont des valeurs documentaires valides, pas des valeurs absentes.

| Opération illustrative sur un champ de couverture | Original | Correction après opération | Effectif |
|---|---:|---|---|
| Aucune correction | 3 | Absente | 3, source machine |
| Correction explicite à zéro | 3 | 0 | 0, source RH |
| Inconnu après revue | 3 | null | Indisponible, source RH |
| Retrait de la correction | 3 | Absente | 3, source machine |
| Champ omis d’un PATCH | 3 | Inchangée | Inchangé |

L’exemple explique le contrat ; il ne représente pas un dossier observé. Dans les exports, `null` apparaît vide, tandis que zéro et faux restent explicites. Pour comprendre un vide, l’export diagnostic fournit le statut et la provenance. La projection compacte utilise les mêmes valeurs effectives mais ne reproduit pas tous les diagnostics privés.

### 5.8.3. Révision et modifications sans effet

La sauvegarde exige l’autorité RH, une origine et une session valides, un état éditable et la révision de revue attendue. L’ensemble des champs est validé avant toute écriture. Une requête périmée mais identique entre en conflit : son identité de valeur ne prouve pas que l’utilisateur a vu le dernier état. À révision courante, une sauvegarde réellement identique ou un retrait déjà absent ne change ni révision, ni date, ni attribution.

Une modification réelle ne touche que les corrections concernées et incrémente une fois la révision de revue de la candidature. Ce compteur sert au contrôle de concurrence, pas à reconstruire un historique complet. L’interface conserve les brouillons locaux en cas de conflit et impose un rafraîchissement puis une réapplication ou un abandon explicites. Elle ne fusionne pas automatiquement deux interprétations humaines du même champ.

## 5.9. Préparation de la revue et barrières de décision

### 5.9.1. Ne pas confondre disponibilité technique et approbation

La préparation dérivée distingue `not_required`, `waiting`, `blocked`, `ready`, `released` et `locked`. Une candidature sans tâche est sans traitement requis et sa revue est automatiquement non applicable ou terminée, sans attribuer un réviseur humain fictif. Pour une candidature avec tâches, la préparation normale exige que chacune ait réussi ou atteint un échec ordinaire terminal non réessayable, sans invocation active.

Les échecs opérationnels, incertains, non classés ou épuisés ne sont pas transformés en préparation normale. Un extracteur dont on ignore l’issue ne devient pas « prêt » parce que le nombre de tentatives est atteint. Cette distinction empêche de confondre fin d’automatisation et qualité de l’information. Elle fournit aussi aux listes et filtres un état factuel plutôt qu’un jugement sur le candidat.

### 5.9.2. Libérer explicitement sans fabriquer un succès

La libération manuelle permet aux RH de renoncer définitivement au traitement restant pour poursuivre l’examen documentaire. Elle requiert confirmation et révision attendue, conserve l’attribution et ferme l’éligibilité au traitement sous verrou de candidature. Les tâches inachevées ne deviennent pas des succès. Les réponses originales et les corrections existantes ne sont pas réécrites. La libération ne termine pas la revue et ne présélectionne pas le candidat.

La revue partagée est modifiable seulement lorsqu’elle est prête ou libérée et encore ouverte. La terminer la verrouille et retire les baux de traitement. Une présélection ou un rejet la verrouille également. La présélection n’exige toutefois pas de présenter l’achèvement de revue comme un prérequis universel : l’état de recrutement reste une dimension distincte. Le système encode des barrières d’écriture, sans inventer un ordre obligatoire que les contrats ne prévoient pas.

[[FIG:CAP-12]]

*Figure — Revue RH et correction par champ à côté du PDF source. Capture actuelle à fournir par l’utilisateur, sur données synthétiques, avec date et mode de résultat ; cet emplacement n’est pas une preuve d’exécution.*

### 5.9.3. Soutenir l’attention plutôt que multiplier les validations implicites

L’interface associe chaque champ au PDF source et distingue inspection, correction, libération et achèvement. Les confirmations portent sur des intentions précises. Une sauvegarde locale nettoie uniquement le brouillon du champ concerné. En cas d’issue inconnue, les mutations sont désactivées jusqu’au rafraîchissement explicite ; aucune nouvelle requête n’est envoyée pour faire disparaître l’incertitude. Les protections de navigation évitent de quitter silencieusement des corrections non enregistrées.

Les exports prolongent cette distinction. L’export diagnostic RH peut inclure tous les dossiers sans gate de revue, avec états, raisons, valeurs originales et effectives. L’export compact de présélection possède ses filtres factuels et ses valeurs effectives. L’import de décisions ne corrige pas l’extraction : il porte une décision humaine confirmée. Ainsi, le tableur reste un moyen d’interopérabilité, non un canal caché d’altération des preuves documentaires.

## 5.10. Limites de portée et conditions d’usage

La chaîne conserve plusieurs limites substantielles. Elle dépend de la qualité de la couche texte native, de l’expression du CV, de la pertinence des questions et de l’interprétation du fournisseur. Les catégories simplifient des situations parfois ambiguës ; les alias configurés ne résolvent pas toute variation lexicale. L’absence d’authentification externe des diplômes et certifications doit rester visible. Une réponse positive documente une déclaration, pas sa véracité sociale ou administrative.

Le caractère privé d’un document ne disparaît pas lorsqu’il devient Markdown ou résultat structuré. Les caches et exports en sont des dérivés sensibles. L’envoi à un service externe nécessite un contexte de destinataires et d’autorisation approprié. L’activation locale documentée ne couvre que de nouvelles soumissions synthétiques après une borne fixe ; elle ne vaut pas consentement général pour des candidatures réelles ni pour un autre déploiement.

La supervision humaine constitue ici un mécanisme produit : consultation de la source, corrections indépendantes, clôtures explicites et décisions séparées. Elle ne suffit pas, à elle seule, à déterminer une qualification juridique ou une conformité. Le rapport ne déduit aucune exemption réglementaire de l’absence de classement automatique. Une telle conclusion demanderait une analyse du contexte et de l’usage effectif qui dépasse les preuves techniques réunies.

## Conclusion du chapitre

L’assistance réalisée organise une chaîne contrôlable entre document et décision humaine. Le texte natif local évite un chemin image systématique ; les cinq familles bornent les questions ; la requête multi-question fournit une unité d’exécution cohérente ; la validation complète évite les valeurs négatives fabriquées. Les caches exacts et le registre durable traitent séparément réutilisation d’un résultat et connaissance d’un envoi. La correction par champ préserve enfin la distinction entre original, interprétation humaine et valeur exportée.

Ces mécanismes rendent la provenance et les limites plus explicites, sans établir une précision, un gain de temps ou une sûreté de reprise mesurés. Le calcul d’entrée illustre un coût possible sous hypothèses, non le coût complet du service. L’appréciation du prototype doit maintenant confronter ces propriétés de source aux observations datées et à un protocole d’évaluation clairement séparé des résultats déjà disponibles.
