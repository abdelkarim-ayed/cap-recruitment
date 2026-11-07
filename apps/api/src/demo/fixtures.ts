import { createHash } from 'node:crypto';
import type { INestApplicationContext } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { DOCUMENT_STORAGE, type DocumentStorage } from '../documents/document-storage.js';
import { FIXTURE_REGISTRY, type FixtureRegistry, type TaskFixture } from '../processing/execution.js';
import { ProcessingRepository } from '../processing/processing.repository.js';
import { ProcessingService } from '../processing/processing.service.js';

export function demoOnly() { if (process.env.NODE_ENV === 'production') throw new Error('Demo commands are forbidden in production.'); }
export async function processDemo(app: INestApplicationContext, id: string, outcome: 'success'|'failure'|'empty') {
  demoOnly();
  const database=app.get(DatabaseService);
  const row=(await database.query('SELECT * FROM applications WHERE id=$1',[id])).rows[0];
  if(!row)throw new Error('Application not found.');
  const attempted=await database.query('SELECT task_id FROM application_tasks WHERE application_id=$1 AND attempts>0',[id]);
  if(attempted.rowCount)throw new Error('Application already attempted. This helper does not rewrite results; use a fresh candidate/application.');
  if(!row.vacancy_snapshot.processingDefinition.tasks.length)throw new Error('No extraction tasks configured on this application.');
  const fixtures:TaskFixture[]=[];
  for(const task of row.vacancy_snapshot.processingDefinition.tasks){
    const source=(await database.query('SELECT d.id,f.storage_ref,f.content_hash FROM application_documents d JOIN stored_files f ON f.id=d.stored_file_id WHERE d.application_id=$1 AND d.input_id=$2',[id,task.sourceInputId])).rows[0];
    if(!source)continue; // Executor persists explicit missing-document failure.
    const bytes=await app.get<DocumentStorage>(DOCUMENT_STORAGE).read(source.storage_ref);
    if(createHash('sha256').update(bytes).digest('hex')!==source.content_hash)throw new Error('Document integrity mismatch.');
    fixtures.push({fixtureKey:`demo-${id}-${task.id}-${outcome}`,applicationId:id,documentId:source.id,sourceHash:source.content_hash,taskId:task.id,args:task.args,
      text:`FIXTURE ONLY: recorded text for document ${source.id}. No parsing performed.`,
      result:outcome==='failure'?{status:'failed',value:null,reason:'FIXTURE ONLY: simulated unreadable document.',retryable:false}:{status:'completed',value:{skills:outcome==='empty'?[]:task.args.skills.slice(0,2)},evidence:task.args.evidence?['FIXTURE ONLY: chosen demonstration skills, not claims about the uploaded document.']:[]}});
  }
  const registry=app.get<FixtureRegistry>(FIXTURE_REGISTRY);registry.load(fixtures);
  await app.get(ProcessingRepository).bind(fixtures);
  const ran=await app.get(ProcessingService).processOne(id);
  if(!ran)throw new Error('Application is not eligible or another executor has claimed it.');
  return fixtures;
}

export { samplePdf } from './sample-pdf.js';
