import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { JwtAuthGuard, RolesGuard } from './common/auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map(x => x.trim()), credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalGuards(app.get(JwtAuthGuard), app.get(RolesGuard));
  const swaggerConfig = new DocumentBuilder().setTitle('CEP.EXCHANGE API').setDescription('REST API cho nền tảng trao đổi thiết bị CEP.EXCHANGE. Dùng nút Authorize để nhập access token dạng Bearer.').setVersion('1.0.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
  console.log(`CEP.EXCHANGE API đang chạy: http://localhost:${port}/api`);
  console.log(`Swagger UI: http://localhost:${port}/docs`);
}
bootstrap();
