declare module 'pg' {
  export class Pool {
    constructor(options?: Record<string, unknown>);
    query<T = unknown>(
      queryText: string,
      values?: readonly unknown[],
    ): Promise<{ rows: T[] }>;
    end(): Promise<void>;
  }
}
