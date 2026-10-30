import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
export const PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user);
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()])) return true;
    const req = ctx.switchToHttp().getRequest();
    const header = req.headers.authorization as string | undefined;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Thiếu access token');
    try { req.user = await this.jwt.verifyAsync(header.slice(7), { secret: process.env.JWT_ACCESS_SECRET }); }
    catch { throw new UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn'); }
    if (!req.user?.sub) throw new UnauthorizedException();
    return true;
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const user = ctx.switchToHttp().getRequest().user;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    return true;
  }
}
