// Single semantic source for the Mermaid and DOT views.
// Conceptual selection of implemented relationships, not an exhaustive DB schema.
export const classes = [
  { id: 'Offre', title: 'Offre', fields: ['titre, statut', 'formulaire, traitement'] },
  { id: 'Candidature', title: 'Candidature', fields: ['réponses figées', 'progression interne'] },
  { id: 'Document', title: 'Document', fields: ['fichier privé', 'empreinte du contenu'] },
  { id: 'Tache', title: 'TâcheExtraction', fields: ['source, paramètres', 'état, résultat original'] },
  { id: 'Correction', title: 'CorrectionRH', fields: ['question, valeur', 'auteur, date'] },
  { id: 'Etape', title: 'ÉtapeEntretien', fields: ['ordre, consignes'] },
  { id: 'Entretien', title: 'Entretien', fields: ['date, interviewer', 'notes, score, Pass/Fail'] },
];
export const associations = [
  ['Offre', 'Candidature', '1', '0..*'],
  ['Offre', 'Etape', '1', '0..*'],
  ['Candidature', 'Document', '1', '0..*'],
  ['Candidature', 'Tache', '1', '0..*'],
  ['Tache', 'Correction', '1', '0..*'],
  ['Candidature', 'Entretien', '1', '0..*'],
  ['Etape', 'Entretien', '1', '0..*'],
];
export const components = [
  { id: 'Web', title: 'Interface web', detail: 'React / Vite', group: 'app' },
  { id: 'Api', title: 'API métier', detail: 'NestJS / TS', group: 'app' },
  { id: 'Data', title: 'Persistance privée', detail: 'PostgreSQL · fichiers', group: 'storage' },
  { id: 'Mail', title: 'Port mail', detail: 'adaptateur', group: 'ports' },
  { id: 'Extraction', title: 'Traitement différé', detail: 'PDF natif · worker', group: 'app' },
  { id: 'Cache', title: 'Caches privés', detail: 'Markdown / réponse', group: 'storage' },
  { id: 'Live', title: 'Jev externe', detail: 'extraction structurée', group: 'external' },
];
export const flows = [
  ['Web', 'Api', 'HTTP\nJSON'],
  ['Api', 'Data', 'ports\nSQL'],
  ['Api', 'Mail', 'port'],
  ['Api', 'Extraction', 'hors\nHTTP'],
  ['Extraction', 'Cache', ''],
  ['Extraction', 'Live', 'JevGateway'],
];
