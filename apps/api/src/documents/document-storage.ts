export const DOCUMENT_STORAGE = Symbol('DOCUMENT_STORAGE');
export interface DocumentStorage {
  put(bytes: Buffer): Promise<string>;
  read(storageRef: string): Promise<Buffer>;
  remove(storageRef: string): Promise<void>;
}
