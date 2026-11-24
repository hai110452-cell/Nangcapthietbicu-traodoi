import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../common/auth';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto } from './auth.dto';
@ApiTags('Auth') @Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  @Public() @Post('register') register(@Body() dto: RegisterDto) { return this.service.register(dto); }
  @Public() @Post('login') login(@Body() dto: LoginDto) { return this.service.login(dto); }
  @Public() @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.service.refresh(dto.refreshToken); }
  @ApiBearerAuth() @Post('logout') logout(@CurrentUser() user: any, @Body() body: RefreshDto) { return this.service.logout(user.sub, body?.refreshToken); }
  @ApiBearerAuth() @Get('me') me(@CurrentUser() user: any) { return this.service.me(user.sub); }
}
