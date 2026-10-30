import { Body, Controller, Get, Module, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { CurrentUser, Roles } from '../common/auth';
import { DatabaseService } from '../db/database.service';
@ApiTags('Users') @ApiBearerAuth() @Controller('users') class UsersController {
 constructor(private db: DatabaseService) {}
 @Get('me') async me(@CurrentUser() user:any) { const r=await this.db.query('SELECT id,full_name AS "fullName",email,avatar_url AS avatar,role,status,created_at AS "createdAt" FROM users WHERE id=$1',[user.sub]); return r.rows[0] || null; }
 @Get() @Roles('admin','moderator') async list() { return (await this.db.query('SELECT id,full_name AS "fullName",email,avatar_url AS avatar,role,status,created_at AS "createdAt" FROM users ORDER BY created_at DESC LIMIT 500')).rows; }
 @Patch(':id/role') @Roles('admin') async role(@Param('id') id:string,@Body() body:any,@CurrentUser() user:any) { if (!['user','moderator','admin'].includes(body.role)) return {error:'role phải là user, moderator hoặc admin'}; if(id===user.sub && body.role!=='admin') return {error:'Không thể tự hạ quyền tài khoản đang đăng nhập'}; const r=await this.db.query('UPDATE users SET role=$2,updated_at=NOW() WHERE id=$1 RETURNING id,role',[id,body.role]); if(r.rowCount) await this.db.query('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)',[user.sub,'user.role.update','user',id,JSON.stringify({role:body.role})]); return r.rows[0] || null; }
 @Patch(':id/status') @Roles('admin') async status(@Param('id') id:string,@Body() body:any,@CurrentUser() user:any) { if (!['active','locked'].includes(body.status)) return {error:'status phải là active hoặc locked'}; if(id===user.sub) return {error:'Không thể tự khóa tài khoản đang đăng nhập'}; const r=await this.db.query('UPDATE users SET status=$2,updated_at=NOW() WHERE id=$1 RETURNING id,status',[id,body.status]); return r.rows[0] || null; }
}
@Module({controllers:[UsersController]}) export class UsersModule {}
