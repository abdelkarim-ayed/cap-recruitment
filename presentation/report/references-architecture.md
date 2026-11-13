# Références des chapitres 3 et 4

Sources internes consultées le 13 novembre 2026. Les chemins sont relatifs à la racine du dépôt ; les symboles et identifiants de migration stabilisent les renvois malgré les changements de numérotation des lignes. Les sources internes décrivent la réalisation, non une preuve automatique de son acceptation. Les références officielles externes sont proposées pour la définition des technologies, sans résultat comparatif ni benchmark attribué à ces documentations.

## Contrats et documentation du projet

- [REF-ARCH-VACANCY] **Vacancy API — implemented contract**. `docs/current/contracts/vacancy-api.md`, notamment « Publish/close », « Public detail » et les opérations sans changement. Les exemples `extractSkills` version 1 sont antérieurs au contrat CV version 2 : pour l’extraction actuelle, utiliser [REF-ARCH-PROCESSING].
- [REF-ARCH-APPLICATION] **Applications and documents — implemented contract**. `docs/current/contracts/application-api.md`, accès, dépôt, projections, stockage et filtres travail/issue.
- [REF-ARCH-INTERVIEW] **Interview pipeline, scheduling and inbox — implemented contract**. `docs/current/contracts/interview-api.md`, modèle, plan, Offer/Hired, causes et effets.
- [REF-ARCH-SCREENING] **Screening export/import and shared decisions**. `docs/current/contracts/screening-api.md`, engagement, aperçu, groupement et confirmation atomique. Les descriptions historiques de colonnes de compétences sont précisées pour le CV actuel par le contrat traitement et `decision-export.ts`.
- [REF-ARCH-PROCESSING] **CV extraction, shared HR review and export — source contract**, actualisé le 13 novembre 2026. `docs/current/contracts/processing-review-api.md`. Référence prioritaire pour CV version 2, worker, caches, corrections par question et barrières de clôture.
- [REF-ARCH-ACTIONS] **Action policies — existing workflow**. `docs/current/contracts/action-policies.md`, propriété des contrôles, inventaire et disponibilité consultative.
- [REF-ARCH-ARCHITECTURE] **Current responsibility and persistence map**. `docs/current/architecture.md`. Utilisé pour les responsabilités ; les mentions anciennes d’absence de poller/cache et de migration 007 non appliquée sont dépassées par les contrats et le statut récents.
- [REF-ARCH-FRONTEND] **Frontend design — durable UI baseline**. `docs/current/guides/frontend-design.md` ; complément : `docs/current/contracts/editor-navigation.md`.
- [REF-ARCH-STATUS] **Current status**, registre daté de vérification. `docs/current/status.md`. Ne pas interpréter un build ou une readiness comme une validation fonctionnelle, privée ou concurrente.
- [REF-ARCH-LAUNCH] **CAP / recruitment demo — launch**. `LAUNCH.md`, modes, installation, caches et limites ; complément : `README.md`, `docs/current/guides/local-networking.md`. Le rapport ne reproduit ni comptes ni commandes propres à une session privée.

## Réalisation : code et schéma

- [REF-ARCH-MIGRATIONS] **Application migrations**. `apps/api/src/database/migrations.ts`, migrations `001_vacancies` à `010_cv_fields_publication` ; en particulier 002 (dépôt/pièces), 003 (tâches/revue), 006 (entretiens/FK composites), 007 (présélection/notices), 008 (libération), 009 (registre de tentative), 010 (date/corrections de champ).
- [REF-ARCH-DOMAIN] **Contrats TypeScript et schémas Zod partagés**. `packages/domain/src/vacancies.ts`, `applications.ts`, `actions.ts`, `workflow-views.ts`, `extractors.ts`, `cv-extractor.ts`, `screening.ts`.
- [REF-ARCH-SRC-MODULES] **Composition applicative et workspaces**. `pnpm-workspace.yaml`, `package.json`, `apps/api/src/app.module.ts`, `apps/api/src/processing/processing.module.ts`, `apps/web/package.json`, `apps/api/package.json`.
- [REF-ARCH-SRC-PUBLICATION] **Publication verrouillée et date de référence**. `apps/api/src/vacancies/vacancy.service.ts`, `transition`, `change`, `sameDraftChanges` ; `apps/api/src/vacancies/vacancy.repository.ts`, `change`, `save`.
- [REF-ARCH-SRC-INTAKE] **Dépôt, projection et téléchargement**. `apps/api/src/applications/application.service.ts`, `submit`, `visible`, `authorize`, `download`, `list` ; `apps/api/src/applications/application-filters.ts`, `application-work.ts`, `candidate-stage.ts`.
- [REF-ARCH-SRC-TRANSACTION] **Accès PostgreSQL**. `apps/api/src/database/database.service.ts`, `withTransaction`, `DatabaseService` ; `apps/api/src/database/migrate.ts`.
- [REF-ARCH-SRC-STORAGE] **Port documentaire et adaptateur local**. `apps/api/src/documents/document-storage.ts`, `local-document-storage.ts`, `bounded-upload.ts`.
- [REF-ARCH-SRC-CLOSURE] **Barrière durable d’éligibilité**. `apps/api/src/processing/processing-policy.ts`, `processingClosed` ; `processing.repository.ts`, `processing.service.ts` ; `apps/api/src/review/review-readiness.ts`.
- [REF-ARCH-SRC-EXECUTION] **Ports et exécution documentaire**. `apps/api/src/processing/execution.ts`, `DocumentMarkdownReader`, `TaskExecutor`, `FixtureRegistry` ; `cv-runner.ts`, `processing-wake.ts`, `cv-file-cache.ts`, `cv-attempt.repository.ts`, `cv-pdf-reader.ts`, `cv-pdf-worker.ts`.
- [REF-ARCH-SRC-REVIEW] **Revue et exports**. `apps/api/src/review/review.service.ts` ; `decision-export.ts`, `decisionHeaders`, `decisionValues`.
- [REF-ARCH-SRC-SCREENING] **Aperçu et décision commune**. `apps/api/src/interviews/screening.service.ts`, `preview`, `apply` ; `screening-command.ts`, `commitScreening` ; `apps/web/src/screening-import.tsx`.
- [REF-ARCH-SRC-NOTIFICATIONS] **Causes et intentions de notification**. `apps/api/src/interviews/interview-cause.ts`, `interview-notification.policy.ts`, `interview.service.ts`.
- [REF-ARCH-SRC-NAVIGATION] **Protection des brouillons**. `apps/web/src/navigation-guard.tsx`, `NavigationBoundary`, `useNavigationGuard` ; `apps/web/src/applications.tsx`, `screening-import.tsx`, `interviews.tsx`. Les renvois aux comportements de revue sont également portés par [REF-ARCH-PROCESSING].
- [REF-ARCH-SRC-MAIL] **Port de courrier et adaptateurs**. `apps/api/src/integrations/mail/mail-sender.ts`, `file-mail-sender.ts`, `memory-mail-sender.ts`, `smtp-mail-sender.ts`.

## Documentation officielle des technologies

Ces URL sont des références documentaires, non des observations expérimentales du projet. Aucun résultat de performance n’en est déduit.

- [REF-ARCH-PNPM] **pnpm — Workspace**. https://pnpm.io/workspaces
- [REF-ARCH-TS] **TypeScript Handbook — The Basics**, notamment effacement des types. https://www.typescriptlang.org/docs/handbook/2/basic-types.html
- [REF-ARCH-ZOD] **Zod — Basic usage**, analyse à l’exécution et inférence. https://zod.dev/basics
- [REF-ARCH-NEST] **NestJS — Modules**. https://docs.nestjs.com/modules
- [REF-ARCH-REACT] **React — Managing State**. https://react.dev/learn/managing-state
- [REF-ARCH-VITE] **Vite — Guide**. https://vite.dev/guide/
- [REF-ARCH-PG-JSON] **PostgreSQL 17 — JSON Types**. https://www.postgresql.org/docs/17/datatype-json.html
- [REF-ARCH-PG-CONSTRAINTS] **PostgreSQL 17 — Constraints**. https://www.postgresql.org/docs/17/ddl-constraints.html
- [REF-ARCH-PG-LOCKS] **PostgreSQL 17 — Explicit Locking**. https://www.postgresql.org/docs/17/explicit-locking.html
- [REF-ARCH-PG-ISOLATION] **PostgreSQL 17 — Transaction Isolation**. https://www.postgresql.org/docs/17/transaction-iso.html
