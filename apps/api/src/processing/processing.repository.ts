import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { Vacancy } from '@recruitment/domain/vacancies';
import { DatabaseService } from '../database/database.service.js';
import type { ExecutionResult, TaskFixture } from './execution.js';

export interface TaskRow { application_id: string; task_id: string; source_input_id: string; output_key: string; type: 'extractSkills'; args: { skills: string[]; evidence: boolean }; fixture_key: string | null; status: string; attempts: number; retryable: boolean }
@Injectable()
export class ProcessingRepository {
  constructor(private readonly database: DatabaseService) {}
  private async initialize(client: PoolClient, id: string, vacancy: Vacancy) {
    for (const task of vacancy.processingDefinition.tasks) await client.query(`INSERT INTO application_tasks(application_id,task_id,source_input_id,output_key,args) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [id, task.id, task.sourceInputId, task.outputKey, JSON.stringify(task.args)]);
  }
  async bind(fixtures: TaskFixture[]) {
    await this.database.transaction(async client => {
      for (const fixture of [...fixtures].sort((a,b) => a.applicationId.localeCompare(b.applicationId))) {
        const result = await client.query('SELECT *,processing_lease_until>now() AS active_lease FROM applications WHERE id=$1 FOR UPDATE', [fixture.applicationId]);
        const row = result.rows[0];
        if (!row || row.active_lease) throw new Error('Fixture binding requires an application without an active processing lease.');
        await this.initialize(client, row.id, row.vacancy_snapshot);
        const update = await client.query('UPDATE application_tasks SET fixture_key=$3 WHERE application_id=$1 AND task_id=$2 AND (attempts=0 OR fixture_key=$3)', [row.id, fixture.taskId, fixture.fixtureKey]);
        if (!update.rowCount) throw new Error('Fixture task absent or already attempted.');
      }
    });
  }
  async claim(id?: string) {
    return this.database.transaction(async client => {
      const result = await client.query(`SELECT * FROM applications WHERE ($1::uuid IS NULL OR id=$1) AND
        (processing_state='pending' OR (processing_state='processing' AND processing_lease_until<now()) OR
        (processing_state='completed_with_errors' AND processing_next_at<=now())) ORDER BY submitted_at,id FOR UPDATE SKIP LOCKED LIMIT 1`, [id ?? null]);
      const row = result.rows[0]; if (!row) return undefined;
      await this.initialize(client, row.id, row.vacancy_snapshot);
      await client.query("UPDATE application_tasks SET status='failed',retryable=true,reason='Interrupted execution; reclaimed expired lease.',result=jsonb_build_object('status','failed','value',NULL,'reason','Interrupted execution; reclaimed expired lease.','retryable',true),updated_at=now() WHERE application_id=$1 AND status='processing'", [row.id]);
      const token = randomUUID();
      await client.query("UPDATE applications SET processing_state='processing',processing_token=$2,processing_lease_until=now()+interval '2 minutes',processing_next_at=NULL WHERE id=$1", [row.id, token]);
      const tasks = await client.query<TaskRow>('SELECT * FROM application_tasks WHERE application_id=$1 ORDER BY task_id', [row.id]);
      // Task type comes from the immutable snapshot; no migration/rewrite of existing rows.
      const definitions = (row.vacancy_snapshot as Vacancy).processingDefinition.tasks;
      return { id: row.id as string, token, tasks: tasks.rows.map(task => ({ ...task, type: definitions.find(definition => definition.id === task.task_id)!.type })) };
    });
  }
  private async fenced<T>(id: string, token: string, operation: (client: PoolClient) => Promise<T>) {
    return this.database.transaction(async client => {
      const current = await client.query('SELECT id FROM applications WHERE id=$1 AND processing_token=$2 AND processing_lease_until>now() FOR UPDATE', [id, token]);
      if (!current.rowCount) throw new Error('Processing lease lost.');
      await client.query("UPDATE applications SET processing_lease_until=now()+interval '2 minutes' WHERE id=$1", [id]);
      return operation(client);
    });
  }
  start(id: string, token: string, taskId: string) {
    return this.fenced(id, token, async client => (await client.query("UPDATE application_tasks SET status='processing',attempts=attempts+1,updated_at=now() WHERE application_id=$1 AND task_id=$2 AND attempts<3 AND (status='pending' OR (status='failed' AND retryable=true)) RETURNING *", [id, taskId])).rows[0] as TaskRow | undefined);
  }
  save(id: string, token: string, taskId: string, value: ExecutionResult) {
    return this.fenced(id, token, async client => {
      await client.query(`UPDATE application_tasks SET status=$3,result=$4,provenance=$5,reason=$6,retryable=$7,updated_at=now() WHERE application_id=$1 AND task_id=$2`, [id,taskId,value.result.status,JSON.stringify(value.result),JSON.stringify(value.provenance),value.result.status === 'failed' ? value.result.reason : null,value.result.status === 'failed' && value.result.retryable]);
      // New extraction invalidates an earlier completion marker, not manual corrections.
      await client.query("UPDATE applications SET review_revision=review_revision+1,review_status=CASE WHEN review_status='completed' THEN 'in_review' ELSE review_status END,reviewed_at=NULL WHERE id=$1", [id]);
    });
  }
  finish(id: string, token: string) {
    return this.fenced(id, token, async client => {
      await client.query(`UPDATE applications SET processing_state=CASE WHEN EXISTS(SELECT 1 FROM application_tasks WHERE application_id=$1 AND status<>'completed') THEN 'completed_with_errors' ELSE 'completed' END,
        processing_next_at=CASE WHEN EXISTS(SELECT 1 FROM application_tasks WHERE application_id=$1 AND status='failed' AND retryable=true AND attempts<3) THEN now()+interval '30 seconds' ELSE NULL END,
        processing_token=NULL,processing_lease_until=NULL WHERE id=$1`, [id]);
    });
  }
  async source(id: string, inputId: string) {
    return (await this.database.query(`SELECT d.id,f.storage_ref,f.content_hash,f.byte_count FROM application_documents d JOIN stored_files f ON f.id=d.stored_file_id WHERE d.application_id=$1 AND d.input_id=$2`, [id,inputId])).rows[0];
  }
}
