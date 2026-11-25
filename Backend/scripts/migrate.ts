import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Thiếu DATABASE_URL trong .env');
  const ds = new DataSource({
    type: 'postgres',
    url,
    synchronize: false,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [],
    migrations: [],
  });
  await ds.initialize();
  try {
    const migrationsDir = join(process.cwd(), 'migrations');
    const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = await readFile(join(migrationsDir, file), 'utf8');
      await ds.query(sql);
      console.log(`Migration ${file} đã chạy thành công.`);
    }
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error('Migration thất bại:', e.message);
  process.exit(1);
});
