import 'reflect-metadata';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { lifecycleCatalog, lifecycleMode, lifecycleSafety } from './lifecycle-catalog.js';

const mode = lifecycleMode(process.argv.slice(2));
const catalog = lifecycleCatalog();
if (mode === 'plan') {
  // No Nest context, environment file, database, storage or provider initialization.
  console.log(JSON.stringify({namespace:catalog.namespace,baseline:catalog.baseline,vacancies:catalog.jobs.map(job=>({key:job.key,id:job.vacancy.id,owner:job.owner.email})),scenarios:catalog.applications.map(application=>({key:application.scenario.key,id:application.id,purpose:application.scenario.purpose}))},null,2));
} else {
  // Load the project environment before checking explicit disabled mode. Do not
  // import AppModule/ProcessingModule: this tool has no gateway/Redis/mail client.
  const { projectRoot } = await import('../configuration/environment.js');
  lifecycleSafety(process.env);
  const [{Module},{NestFactory},{DatabaseModule},{DatabaseService},{DocumentsModule},{DOCUMENT_STORAGE},{seedLifecycle},{hashPassword},{samplePdf}] = await Promise.all([
    import('@nestjs/common'),import('@nestjs/core'),import('../database/database.module.js'),import('../database/database.service.js'),
    import('../documents/documents.module.js'),import('../documents/document-storage.js'),import('./lifecycle-store.js'),import('better-auth/crypto'),import('./sample-pdf.js'),
  ]);
  class LifecycleModule {}
  Module({imports:[DatabaseModule,DocumentsModule]})(LifecycleModule);
  const app = await NestFactory.createApplicationContext(LifecycleModule,{logger:false});
  try {
    const storage = app.get<import('../documents/document-storage.js').DocumentStorage>(DOCUMENT_STORAGE);
    const result = await seedLifecycle(app.get(DatabaseService),storage,catalog,mode==='reset',await hashPassword('DemoRecruitment!2026'));
    if (result.status==='preserved') {
      console.log('Existing lifecycle dataset preserved, including dates and user edits. Use explicit reset to rebuild it.');
    } else {
      // Manifest describes declared seed snapshots, not current mutable UI state.
      const directory = join(projectRoot,'.local','demo','lifecycle');
      try {
        await mkdir(directory,{recursive:true,mode:0o700});
        for (const application of catalog.applications) await writeFile(join(directory,`${application.scenario.key}-cv.pdf`),samplePdf(application.lines),{mode:0o600});
        await writeFile(join(directory,'manifest.json'),JSON.stringify({namespace:catalog.namespace,baseline:catalog.baseline,provenance:'Declared synthetic snapshots; no workflow commands, parsing or AI execution.',accounts:catalog.actors.map(({id,name,email,role})=>({id,name,email,role})),vacancies:catalog.jobs.map(job=>({key:job.key,id:job.vacancy.id,title:job.vacancy.title,owner:job.owner.email,status:job.vacancy.status})),applications:catalog.applications.map(application=>({key:application.scenario.key,id:application.id,vacancyId:application.job.vacancy.id,candidate:application.candidate.email,stage:application.stage,purpose:application.scenario.purpose,submittedAt:application.submittedAt,url:`/#/applications/${application.id}`,sample:`${application.scenario.key}-cv.pdf`}))},null,2)+'\n',{mode:0o600});
      } catch {
        throw new Error('Lifecycle DB transaction committed, but local manifest/sample export failed. Do not assume rollback; inspect output directory before another operation.');
      }
      console.log(`Seeded ${catalog.jobs.length} vacancies and ${catalog.applications.length} declared synthetic lifecycle scenarios. No AI, mail, migrations or service startup.`);
      console.log('Manifest and upload samples: .local/demo/lifecycle/. Demo passwords are created only when absent.');
      if (result.cleanupPending) console.log(`DB reset committed; ${result.cleanupPending} retired demo document object(s) retained after uncertain/failed cleanup. No broad reconciliation attempted.`);
    }
  } finally { await app.close(); }
}
