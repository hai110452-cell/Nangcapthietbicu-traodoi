import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/auth';
import { DatabaseService } from '../db/database.service';
@ApiTags('Categories') @Controller('categories') class CategoriesController { constructor(private db: DatabaseService) {} @Public() @Get() async all() { return (await this.db.query('SELECT id,code,name,icon,sort_order AS "sortOrder" FROM categories WHERE is_active=true ORDER BY sort_order,name')).rows; } }
@Module({ controllers: [CategoriesController] }) export class CategoriesModule {}
