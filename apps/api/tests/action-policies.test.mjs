import { test } from 'node:test';
import { equal } from 'node:assert/strict';
import { roleAllows } from '@recruitment/domain';
import { canReadApplication } from '../dist/applications/application.policy.js';
import { reviewEditable } from '../dist/review/review.policy.js';
import { vacancyActions } from '../dist/vacancies/vacancy.policy.js';
import { editableInterviewPlan, interviewActions, workflowActions } from '../dist/interviews/interview.policy.js';

// Pure/offline specifications. Execution is deferred as Q-R1A; rebuild first.
test('coarse eligibility does not turn ownership or assignment into a role', () => {
  equal(roleAllows('admin', 'vacancy.edit'), true);
  equal(roleAllows('interviewer', 'application.read'), false);
  equal(roleAllows('interviewer', 'interview.application'), true);
  equal(roleAllows('candidate', 'review.read'), false);
  equal(roleAllows('candidate', 'notification.list'), false);
});
test('candidate ownership and interviewer assignment remain resource-scoped', () => {
  equal(canReadApplication({ id:'candidate', role:'candidate' }, 'candidate', false), true);
  equal(canReadApplication({ id:'other', role:'candidate' }, 'candidate', false), false);
  equal(canReadApplication({ id:'staff', role:'interviewer' }, 'candidate', false), false);
  equal(canReadApplication({ id:'staff', role:'interviewer' }, 'candidate', true), true);
  equal(canReadApplication({ id:'hr', role:'recruiter' }, 'candidate', false), true);
});
test('vacancy owner/state rules preserve same-state command eligibility', () => {
  const vacancy={ownerId:'owner',status:'draft',formDefinition:{inputs:[{type:'text'}]}};
  equal(vacancyActions(vacancy,'owner').edit.allowed, true);
  equal(vacancyActions(vacancy,'admin').edit.allowed, false);
  const published=vacancyActions({...vacancy,status:'published'},'owner');
  equal(published.edit.allowed, false);
  equal(published.publish.allowed, true);
  equal(published.publish.visible, false);
  equal(published.close.visible, true);
});
test('review behavior is current, not the planned completion/selection lock', () => {
  equal(reviewEditable(true).allowed, true);
  equal(reviewEditable(false).allowed, false);
  equal(editableInterviewPlan(true).allowed, false);
});
test('shared screening does not depend on review and owner has no zero-interview offer path yet', () => {
  const context={ownerId:'owner',stage:'received',total:0,passed:0};
  equal(workflowActions({id:'other',role:'recruiter'},context).preselect.allowed, true);
  equal(workflowActions({id:'owner',role:'recruiter'},{...context,stage:'preselected'}).offer.allowed, false);
  equal(workflowActions({id:'owner',role:'recruiter'},{...context,stage:'interview'}).offer.allowed, false);
});
test('offer requires the owner and every configured interview passed', () => {
  const context={ownerId:'owner',stage:'interview',total:2,passed:1};
  const blocked=workflowActions({id:'owner',role:'recruiter'},context).offer;
  equal(blocked.visible,true);equal(blocked.allowed,false);
  equal(workflowActions({id:'owner',role:'recruiter'},{...context,passed:2}).offer.allowed,true);
  equal(workflowActions({id:'other',role:'admin'},{...context,passed:2}).offer.allowed,false);
});
test('requesting rescheduling is distinct from time-gated feedback', () => {
  const context={interviewerId:'assigned',stage:'interview',status:'scheduled',startsAt:'2999-01-01T00:00:00Z',hasApplicationAssignment:true};
  const actions=interviewActions({id:'assigned',role:'recruiter'},context);
  equal(actions.requestRescheduling.allowed,true);
  equal(actions.submitFeedback.visible,true);equal(actions.submitFeedback.allowed,false);
  equal(interviewActions({id:'other',role:'admin'},context).submitFeedback.allowed,false);
  equal(interviewActions({id:'assigned',role:'interviewer'},{...context,startsAt:'2000-01-01T00:00:00Z'}).submitFeedback.allowed,true);
});
test('cancelled appointment UI remains hidden even when HR retains application access', () => {
  const context={interviewerId:'assigned',stage:'interview',status:'cancelled',startsAt:'2000-01-01T00:00:00Z',hasApplicationAssignment:false};
  const staff=interviewActions({id:'hr',role:'recruiter'},context).readApplication;
  equal(staff.allowed,true);equal(staff.visible,false);
  equal(interviewActions({id:'assigned',role:'interviewer'},context).readApplication.allowed,false);
  const anotherAssignment=interviewActions({id:'assigned',role:'interviewer'},{...context,hasApplicationAssignment:true}).readApplication;
  equal(anotherAssignment.allowed,true);equal(anotherAssignment.visible,false);
});
