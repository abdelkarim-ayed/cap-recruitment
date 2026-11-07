// Durable eligibility boundary shared by staff projections and review policy.
export interface ProcessingBoundary { stage: string; review_status: string; processing_released_at?: Date | string | null }
export const processingClosed = (row: ProcessingBoundary) => !['received','review_ready'].includes(row.stage)
  || row.review_status === 'completed' || row.processing_released_at != null;
