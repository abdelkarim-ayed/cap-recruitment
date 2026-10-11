// Single semantic source for the Mermaid and DOT views.
// Conceptual selection of implemented relationships, not an exhaustive DB schema.
export const classes = [
  { id: 'Offre', title: 'Offre', fields: ['titre, statut', 'formulaire, traitement'] },
  { id: 'Candidature', title: 'Candidature', fields: ['réponses figées', 'progression interne'] },
  { id: 'Document', title: 'Document', fields: ['fichier privé', 'empreinte du contenu'] },
  { id: 'Tache', title: 'TâcheExtraction', fields: ['source, paramètres', 'état, résultat original'] },
  { id: 'Correction', title: 'CorrectionRH', fields: ['valeur, auteur, date'] },
  { id: 'Etape', title: 'ÉtapeEntretien', fields: ['ordre, consignes'] },
  { id: 'Entretien', title: 'Entretien', fields: ['date, interviewer', 'notes, score, Pass/Fail'] },
];
export const associations = [
  ['Offre', 'Candidature', '1', '0..*'],
  ['Offre', 'Etape', '1', '0..*'],
  ['Candidature', 'Document', '1', '0..*'],
  ['Candidature', 'Tache', '1', '0..*'],
  ['Tache', 'Correction', '1', '0..1'],
  ['Candidature', 'Entretien', '1', '0..*'],
  ['Etape', 'Entretien', '1', '0..*'],
];
export const components = [
  { id: 'Web', title: 'Interface web', detail: 'React / Vite', group: 'app' },
  { id: 'Api', title: 'API métier', detail: 'NestJS / TypeScript', group: 'app' },
  { id: 'Db', title: 'PostgreSQL', detail: 'données persistantes', group: 'storage' },
  { id: 'Files', title: 'Documents privés', detail: 'stockage local', group: 'storage' },
  { id: 'Mail', title: 'Port mail', detail: 'adaptateur remplaçable', group: 'ports' },
  { id: 'Extraction', title: 'Ports extraction', detail: 'lecteur + exécuteur', group: 'ports' },
  { id: 'Fixtures', title: 'Fixtures locales', detail: 'exécution explicite', group: 'current' },
  { id: 'Live', title: 'Lecture PDF/DOCX + IA', detail: 'à intégrer', group: 'future' },
];
export const flows = [
  ['Web', 'Api', 'HTTP / JSON', false],
  ['Api', 'Db', '', false],
  ['Api', 'Files', '', false],
  ['Api', 'Mail', '', false],
  ['Api', 'Extraction', '', false],
  ['Extraction', 'Fixtures', 'actuel', false],
  ['Extraction', 'Live', 'extension', true],
];
