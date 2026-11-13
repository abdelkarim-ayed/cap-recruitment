import { Injectable } from '@nestjs/common';

// A hint only: database claims/eligibility remain authoritative. Lost/overflowed
// wake hints are recovered by periodic scans, never by blocking a submission.
@Injectable()
export class ProcessingWake {
  private readonly pending = new Set<string>();
  private listener?: () => void;
  enqueue(id: string) {
    if (this.pending.size < 128) this.pending.add(id);
    this.listener?.();
  }
  take() { const id = this.pending.values().next().value; if (id) this.pending.delete(id); return id; }
  listen(listener?: () => void) { this.listener = listener; }
}
