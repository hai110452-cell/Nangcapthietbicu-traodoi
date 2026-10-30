import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

export interface DbResult<T = any> { rows: T[]; rowCount: number | null; }
export interface DbExecutor { query<T = any>(sql: string, params?: unknown[]): Promise<DbResult<T>>; }

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly dataSource: DataSource;
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL chưa được khai báo trong file .env');
    this.dataSource = new DataSource({
      type: 'postgres', url, synchronize: false, logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      extra: { max: Number(process.env.DATABASE_POOL_MAX || 10), connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 },
      entities: [], migrations: [],
    });
  }
  async onModuleInit() { if (!this.dataSource.isInitialized) await this.dataSource.initialize(); }
  async onModuleDestroy() { if (this.dataSource.isInitialized) await this.dataSource.destroy(); }
  async query<T = any>(sql: string, params: unknown[] = []): Promise<DbResult<T>> {
    const rows = await this.dataSource.query(sql, params) as T[];
    return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : null };
  }
  async transaction<T>(work: (client: DbExecutor) => Promise<T>): Promise<T> {
    const runner: QueryRunner = this.dataSource.createQueryRunner();
    await runner.connect(); await runner.startTransaction();
    const client: DbExecutor = { query: async <R = any>(sql: string, params: unknown[] = []) => {
      const rows = await runner.query(sql, params) as R[];
      return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : null };
    }};
    try { const result = await work(client); await runner.commitTransaction(); return result; }
    catch (error) { await runner.rollbackTransaction(); throw error; }
    finally { await runner.release(); }
  }
}
