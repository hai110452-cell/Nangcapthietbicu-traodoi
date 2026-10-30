import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { TradesModule } from './trades/trades.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { RewardsModule } from './rewards/rewards.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { SystemController } from './system.controller';
@Module({ imports: [DatabaseModule, JwtModule.register({}), AuthModule, ListingsModule, TradesModule, ReviewsModule, ChatModule, RewardsModule, AdminModule, CategoriesModule, UsersModule], controllers: [SystemController], providers: [JwtAuthGuard, RolesGuard] })
export class AppModule {}
