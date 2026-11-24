import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from '../common/auth';
import { DatabaseService } from '../db/database.service';

@ApiTags('Categories')
@Controller('categories')
class CategoriesController {
  constructor(private db: DatabaseService) {}

  @Public()
  @Get()
  async all() {
    return (
      await this.db.query(
        'SELECT id, code, name, icon, sort_order AS "sortOrder", is_active AS "isActive", created_at AS "createdAt" FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC'
      )
    ).rows;
  }

  @Public()
  @Get(':code')
  async getByCode(@Param('code') code: string) {
    const r = await this.db.query(
      'SELECT id, code, name, icon, sort_order AS "sortOrder", is_active AS "isActive", created_at AS "createdAt" FROM categories WHERE code = $1',
      [code]
    );
    return r.rows[0] || null;
  }

  @ApiBearerAuth()
  @Get('admin/all')
  @Roles('admin', 'moderator')
  async allForAdmin() {
    return (
      await this.db.query(
        'SELECT id, code, name, icon, sort_order AS "sortOrder", is_active AS "isActive", created_at AS "createdAt" FROM categories ORDER BY sort_order ASC, name ASC'
      )
    ).rows;
  }

  @ApiBearerAuth()
  @Post()
  @Roles('admin')
  async create(@Body() body: any) {
    if (!body.code || !body.name) return { error: 'Thiếu mã hoặc tên danh mục' };
    const r = await this.db.query(
      'INSERT INTO categories(code, name, icon, sort_order, is_active) VALUES($1, $2, $3, COALESCE($4, 0), COALESCE($5, true)) RETURNING id, code, name, icon, sort_order AS "sortOrder", is_active AS "isActive", created_at AS "createdAt"',
      [String(body.code).trim().toLowerCase(), String(body.name).trim(), body.icon || '📱', Number(body.sortOrder || 0), body.isActive ?? true]
    );
    return r.rows[0];
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const r = await this.db.query(
      'UPDATE categories SET name = COALESCE($2, name), icon = COALESCE($3, icon), sort_order = COALESCE($4, sort_order), is_active = COALESCE($5, is_active) WHERE id = $1 RETURNING id, code, name, icon, sort_order AS "sortOrder", is_active AS "isActive", created_at AS "createdAt"',
      [id, body.name, body.icon, body.sortOrder !== undefined ? Number(body.sortOrder) : null, body.isActive]
    );
    if (!r.rowCount) return { error: 'Không tìm thấy danh mục' };
    return r.rows[0];
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const used = await this.db.query('SELECT COUNT(*)::int AS count FROM listings WHERE category_id = $1 AND deleted_at IS NULL', [id]);
    if (used.rows[0].count > 0) {
      await this.db.query('UPDATE categories SET is_active = false WHERE id = $1', [id]);
      return { success: true, message: 'Danh mục đang có bài đăng nên đã được chuyển sang trạng thái ẩn (is_active = false)' };
    }
    await this.db.query('DELETE FROM categories WHERE id = $1', [id]);
    return { success: true };
  }
}

@Module({ controllers: [CategoriesController] })
export class CategoriesModule {}
