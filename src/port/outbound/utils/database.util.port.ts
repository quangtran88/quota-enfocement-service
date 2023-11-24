export const DATABASE_UTIL = Symbol("DATABASE_UTIL");

export interface IDatabaseUtil {
  startTransaction(execution: () => Promise<void>): Promise<void>;
}
