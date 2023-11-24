export const LOCK_UTIL = Symbol("LOCK_UTIL");

export interface ILockUtil {
  acquireLock(key: string, execution: () => Promise<void>): Promise<void>;
}
