export interface ConnectivityProbe { check(): Promise<void> }
export const REDIS_PROBE = Symbol('REDIS_PROBE');
