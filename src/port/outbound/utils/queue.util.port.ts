export const QUEUE_UTIL = Symbol("QUEUE_UTIL");

export interface IQueueUtil {
  publish<T>(queueName: string, message: T): Promise<void>;
}
