import type { StaffVacancy, VacancyActions } from '@recruitment/domain';
import type { Vacancy } from '@recruitment/domain/vacancies';
import { availability, denied, firstDenied, permitted } from '../auth/action-policy.js';

export const vacancyOwner = (actorId: string, ownerId: string) => actorId === ownerId
  ? permitted : denied(403, 'Only the vacancy owner can change this vacancy.');
export const editableDraft = (status: Vacancy['status']) => status === 'draft'
  ? permitted : denied(409, 'Only draft vacancies can be edited.');
export const vacancyTransition = (status: Vacancy['status'], target: 'published' | 'closed') =>
  status === target || (target === 'published' ? status === 'draft' : status === 'published')
    ? permitted : denied(409, 'Invalid vacancy transition.');
export const publishableIntake = (vacancy: Vacancy) => vacancy.formDefinition.inputs.some(input => input.type !== 'separator')
  ? permitted : denied(400, 'Publish requires at least one answer/document input.');

export function vacancyActions(vacancy: Vacancy, actorId: string): VacancyActions {
  const owner = vacancyOwner(actorId, vacancy.ownerId);
  return {
    edit: availability(firstDenied(owner, editableDraft(vacancy.status))),
    publish: availability(firstDenied(owner, vacancyTransition(vacancy.status, 'published'), vacancy.status==='draft'?publishableIntake(vacancy):permitted),owner.allowed&&vacancy.status==='draft'),
    close: availability(firstDenied(owner, vacancyTransition(vacancy.status, 'closed')),owner.allowed&&vacancy.status==='published'),
  };
}

export function withVacancyActions(vacancy: Vacancy, actorId: string): StaffVacancy {
  return { ...vacancy, actions: vacancyActions(vacancy, actorId) };
}
