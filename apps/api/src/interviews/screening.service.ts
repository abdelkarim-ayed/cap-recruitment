import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { parseScreeningCsv, screeningRowIssues, screeningLimits, type ScreeningInput, type ScreeningPreview, type ScreeningRow } from '@recruitment/domain';
import { DatabaseService } from '../database/database.service.js';
import type { AuthenticatedRequest } from '../auth/access.js';
import { requirePolicy, rolePolicy } from '../auth/action-policy.js';
import { commitScreening, undecided } from './screening-command.js';

const selection = z.strictObject({
  applicationId:z.uuid(),email:z.email().max(320),decision:z.enum(['preselected','rejected']),
  reason:z.string().trim().max(2000).optional(),expectedRevision:z.number().int().positive(),
});
const applySchema = z.strictObject({ rows:z.array(selection).min(1).max(screeningLimits.rows) });
type Actor = AuthenticatedRequest['actor'];
interface RecordRow {
  id:string;stage:string;flow_revision:number;candidate_id:string;candidate_identity:{name:string;email:string};
}
@Injectable()
export class ScreeningService {
  constructor(private readonly database:DatabaseService) {}
  async preview(vacancyId:string,actor:Actor,csv:string):Promise<ScreeningPreview> {
    requirePolicy(rolePolicy(actor,'workflow.change'));
    let input:ScreeningInput[];
    try { input=parseScreeningCsv(csv); } catch(error) { throw new BadRequestException(error instanceof Error?error.message:'Invalid CSV.'); }
    const duplicateKeys=new Map<string,number[]>();
    for(const row of input)duplicateKeys.set(row.applicationId,[...(duplicateKeys.get(row.applicationId)??[]),row.key]);
    return this.database.transaction(async client=>{
      if(!(await client.query('SELECT id FROM vacancies WHERE id=$1',[vacancyId])).rowCount)throw new NotFoundException('Vacancy not found.');
      const ids=[...new Set(input.filter(row=>z.uuid().safeParse(row.applicationId).success&&z.email().max(320).safeParse(row.email).success).map(row=>row.applicationId))];
      const records=ids.length?(await client.query<RecordRow>('SELECT id,stage,flow_revision,candidate_id,candidate_identity FROM applications WHERE vacancy_id=$1 AND id=ANY($2::uuid[])',[vacancyId,ids])).rows:[];
      const byId=new Map(records.map(row=>[row.id,row]));
      return {rows:input.map((row):ScreeningRow=>{
        const issues=screeningRowIssues(row),keys=duplicateKeys.get(row.applicationId)!;
        const base={...row,candidate:null,revision:null,duplicateKeys:keys.length>1?keys:[],issues};
        const record=byId.get(row.applicationId);
        const validIdentity=z.uuid().safeParse(row.applicationId).success&&z.email().max(320).safeParse(row.email).success;
        const matched=record&&record.candidate_identity.email.trim().toLowerCase()===row.email;
        if(validIdentity&&!matched)issues.push(record?'Account email does not match this submitted application. Fix the CSV; identity cannot be changed here.':'Application unavailable in this vacancy.');
        if(!matched)return {...base,state:'invalid',issue:issues.join(' ')};
        const resolved={...base,candidate:record.candidate_identity,revision:record.flow_revision};
        if(!undecided(record.stage))return {...resolved,state:'decided',issue:'Screening decision already recorded. This import cannot change it.'};
        return {...resolved,state:issues.length?'invalid':'valid',issue:issues.length?issues.join(' '):null};
      })};
    });
  }
  async apply(vacancyId:string,actor:Actor,raw:unknown) {
    requirePolicy(rolePolicy(actor,'workflow.change'));
    const parsed=applySchema.safeParse(raw);
    if(!parsed.success)throw new BadRequestException('Invalid screening confirmation.');
    const rows=parsed.data.rows.map(row=>({...row,applicationId:row.applicationId.toLowerCase(),email:row.email.trim().toLowerCase()}));
    if(new Set(rows.map(row=>row.applicationId)).size!==rows.length)throw new BadRequestException('Duplicate application ID.');
    return this.database.transaction(async client=>{
      if(!(await client.query('SELECT id FROM vacancies WHERE id=$1 FOR SHARE',[vacancyId])).rowCount)throw new NotFoundException('Vacancy not found.');
      const records=(await client.query<RecordRow>('SELECT * FROM applications WHERE vacancy_id=$1 AND id=ANY($2::uuid[]) ORDER BY id FOR UPDATE',[vacancyId,rows.map(row=>row.applicationId)])).rows;
      const byId=new Map(records.map(row=>[row.id,row]));
      const conflicts=rows.flatMap(row=>{
        const record=byId.get(row.applicationId);
        const issue=!record?'Application unavailable in this vacancy.':record.candidate_identity.email.trim().toLowerCase()!==row.email?'Email does not match this application.'
          :!undecided(record.stage)?'Screening decision already recorded.':record.flow_revision!==row.expectedRevision?'Application changed; review again.':null;
        return issue?[{applicationId:row.applicationId,state:record&&!undecided(record.stage)?'decided':'invalid',issue}]:[];
      });
      if(conflicts.length)throw new ConflictException({message:'Nothing from this confirmation was applied. Review the conflicting rows and confirm the remaining selection.',conflicts});
      for(const row of [...rows].sort((a,b)=>a.applicationId.localeCompare(b.applicationId)))await commitScreening(client,byId.get(row.applicationId)!,actor,row.decision,row.reason);
      return {applied:rows.length,preselected:rows.filter(row=>row.decision==='preselected').length,rejected:rows.filter(row=>row.decision==='rejected').length};
    });
  }
}
