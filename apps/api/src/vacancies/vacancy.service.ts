import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { isDeepStrictEqual } from 'node:util';
import { createVacancySchema, patchVacancySchema, publicVacancy, publishVacancySchema, vacancyActionSchema, vacancyListSchema, vacancyDefinitionsSchema, type PatchVacancy, type Vacancy } from '@recruitment/domain/vacancies';
import { storedInterviewPlanSchema } from '@recruitment/domain';
import { VacancyRepository, type PublicationPlan } from './vacancy.repository.js';
import { requirePolicy, rolePolicy } from '../auth/action-policy.js';
import type { AuthenticatedRequest } from '../auth/access.js';
import { editableDraft, publishableIntake, vacancyOwner, vacancyTransition } from './vacancy.policy.js';

function parse<T>(schema: { safeParse(value: unknown): { success: true; data: T } | { success: false; error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] } } }, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new BadRequestException({ statusCode: 400, error: 'Bad Request', message: 'Invalid vacancy payload.', issues: result.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) });
  return result.data;
}

function sameDraftChanges(current: Vacancy, changes: Omit<PatchVacancy, 'expectedRevision'>): boolean {
  // Normalize only submitted fields using the same schema as the incoming patch.
  // Object-key order is irrelevant; input/choice/task/skill array order is retained.
  const previous: Record<string, unknown> = { expectedRevision: current.revision };
  for (const field of Object.keys(changes) as (keyof typeof changes)[]) previous[field] = current[field];
  const normalized = patchVacancySchema.safeParse(previous);
  // A valid replacement must still be able to repair invalid legacy field data.
  return normalized.success && isDeepStrictEqual(normalized.data, { expectedRevision: current.revision, ...changes });
}

@Injectable()
export class VacancyService {
  constructor(private readonly repository: VacancyRepository) {}
  create(ownerId: string, body: unknown) { return this.repository.create(ownerId, parse(createVacancySchema, body)); }
  list(publicOnly: boolean, query: unknown) { const { limit, offset,status,sort } = parse(vacancyListSchema, query); return this.repository.list(publicOnly, limit, offset,status,sort); }
  listStaff(actor:AuthenticatedRequest['actor'],query:unknown){
    requirePolicy(rolePolicy(actor,'vacancy.read'));
    const {limit,offset,status,sort,owner}=parse(vacancyListSchema.extend({owner:z.string().min(1).max(200).optional()}),query);
    return this.repository.list(false,limit,offset,status,sort,owner==='me'?actor.id:owner);
  }
  owners(actor:AuthenticatedRequest['actor']){
    requirePolicy(rolePolicy(actor,'vacancy.read'));
    return this.repository.owners();
  }
  listForCandidate(actor:{id:string;role:string},query:unknown){
    if(actor.role!=='candidate')throw new ForbiddenException('Candidate account required.');
    const {limit,offset,sort,notApplied}=parse(vacancyListSchema.pick({limit:true,offset:true,sort:true}).extend({notApplied:z.enum(['true','false']).optional()}),query);
    return this.repository.listForCandidate(actor.id,limit,offset,sort,notApplied==='true');
  }
  get(id: string, publicOnly?: false): Promise<Vacancy>;
  get(id: string, publicOnly: true): Promise<ReturnType<typeof publicVacancy>>;
  async get(id: string, publicOnly = false) {
    const value = await this.repository.get(id, publicOnly);
    if (!value) throw new NotFoundException('Vacancy not found.');
    return publicOnly ? publicVacancy(value) : value;
  }
  async patch(id: string, actorId: string, body: unknown) {
    const { expectedRevision, ...changes } = parse(patchVacancySchema, body);
    return this.change(id, actorId, current => {
      requirePolicy(editableDraft(current.status));
      this.checkRevision(current, expectedRevision);
      if (sameDraftChanges(current, changes)) return current;
      return { ...current, ...changes };
    });
  }
  async transition(id: string, actorId: string, target: 'published' | 'closed', body: unknown) {
    const publication = target === 'published' ? parse(publishVacancySchema, body) : undefined;
    const { expectedRevision } = publication ?? parse(vacancyActionSchema, body);
    return this.change(id, actorId, async (current, readPlan) => {
      if (current.status === target) return current;
      this.checkRevision(current, expectedRevision);
      requirePolicy(vacancyTransition(current.status,target));
      if (target === 'published') {
        parse(vacancyDefinitionsSchema, { formDefinition: current.formDefinition, processingDefinition: current.processingDefinition });
        requirePolicy(publishableIntake(current));
        const plan = await readPlan();
        if (plan.revision !== publication!.expectedInterviewRevision) throw new ConflictException('Interview plan changed; reload it before publishing.');
        parse(storedInterviewPlanSchema, plan.entries);
      }
      return { ...current, status: target };
    });
  }
  private checkRevision(current: Vacancy, expected: number) { if (current.revision !== expected) throw new ConflictException('Vacancy changed; reload before retrying.'); }
  private async change(id: string, actorId: string, operation: (current: Vacancy, readPlan: () => Promise<PublicationPlan>) => Vacancy | Promise<Vacancy>) {
    const result = await this.repository.change(id, (current, readPlan) => {
      requirePolicy(vacancyOwner(actorId,current.ownerId));
      return operation(current, readPlan);
    });
    if (!result) throw new NotFoundException('Vacancy not found.');
    return result;
  }
}
