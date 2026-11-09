import { reviewReadinessSql } from '../review/review-readiness.js';

// Factual work, not authorization. Reused before list/count/export pagination.
export const applicationWorkSql=`CASE
 WHEN applications.stage='not_selected' THEN 'not_selected'
 WHEN applications.stage='hired' THEN 'hired'
 WHEN applications.stage='offer' THEN 'offer_recorded'
 WHEN applications.stage IN ('received','review_ready') AND
   (jsonb_array_length(applications.vacancy_snapshot->'processingDefinition'->'tasks')=0 OR applications.review_status='completed') THEN 'for_screening'
 WHEN applications.stage IN ('received','review_ready') AND (${reviewReadinessSql}) IN ('ready','released') THEN 'for_review'
 WHEN applications.stage IN ('received','review_ready') THEN 'processing'
 WHEN applications.stage='preselected' AND NOT EXISTS(SELECT 1 FROM interview_steps s WHERE s.vacancy_id=applications.vacancy_id) THEN 'awaiting_offer'
 WHEN applications.stage='interview' AND EXISTS(SELECT 1 FROM interview_steps s WHERE s.vacancy_id=applications.vacancy_id)
   AND NOT EXISTS(SELECT 1 FROM interview_steps s LEFT JOIN interviews i ON i.step_id=s.id AND i.application_id=applications.id
     WHERE s.vacancy_id=applications.vacancy_id AND (i.status IS DISTINCT FROM 'completed' OR i.outcome IS DISTINCT FROM 'pass')) THEN 'awaiting_offer'
 WHEN applications.stage IN ('preselected','interview') THEN 'interviewing'
 ELSE 'other' END`;
export const recruitmentStatusSql=`CASE WHEN applications.stage IN ('received','review_ready') THEN 'received' ELSE applications.stage END`;
