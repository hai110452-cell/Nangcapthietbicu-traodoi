import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/auth';
import { DatabaseService } from './db/database.service';
@ApiTags('System')
@Controller()
export class SystemController {
  constructor(private db: DatabaseService) {}
  @Public() @Get() @ApiOperation({ summary: 'Trang giới thiệu API và hướng dẫn sử dụng' })
  async home() {
    let database = 'unknown';
    try { await this.db.query('SELECT 1'); database = 'connected'; } catch { database = 'disconnected'; }
    return { name: 'CEP.EXCHANGE API', status: 'running', database, docs: '/docs', prefix: '/api', instructions: { auth: 'POST /api/auth/register hoặc POST /api/auth/login; gửi access token qua Authorization: Bearer <token>', pagination: 'Danh sách hỗ trợ page và limit', roles: ['user', 'moderator', 'admin'], migrations: 'npm run db:migrate', seed: 'npm run db:seed' }, endpoints: { auth: '/api/auth', listings: '/api/listings', categories: '/api/categories', trades: '/api/trades', reviews: '/api/reviews', chat: '/api/chat', rewards: '/api/rewards', admin: '/api/admin', users: '/api/users' } };
  }
  @Public() @Get('health') async health() { await this.db.query('SELECT 1'); return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() }; }
}
