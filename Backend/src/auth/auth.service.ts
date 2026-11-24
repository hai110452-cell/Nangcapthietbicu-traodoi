import { ConflictException, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID, createHash, randomBytes } from 'crypto';
import { DatabaseService } from '../db/database.service';
import { LoginDto, RegisterDto } from './auth.dto';
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
@Injectable()
export class AuthService {
  constructor(private db: DatabaseService, private jwt: JwtService) {}
  private async issue(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' } as any);
    const refreshToken = randomBytes(48).toString('hex');
    await this.db.query('INSERT INTO refresh_tokens(user_id, token_hash, expires_at) VALUES($1,$2,NOW() + $3::interval)', [user.id, hashToken(refreshToken), process.env.JWT_REFRESH_EXPIRES_IN || '7 days']);
    return { accessToken, refreshToken, user: { id: user.id, name: user.full_name, fullName: user.full_name, email: user.email, avatar: user.avatar_url, role: user.role, status: user.status } };
  }
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rowCount) throw new ConflictException('Email đã được sử dụng');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const result = await this.db.query('INSERT INTO users(full_name,email,password_hash) VALUES($1,$2,$3) RETURNING id,full_name,email,avatar_url,role,status', [dto.fullName.trim(), email, passwordHash]);
    return this.issue(result.rows[0]);
  }
  async login(dto: LoginDto) {
    const result = await this.db.query('SELECT * FROM users WHERE email=$1', [dto.email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    if (user.status !== 'active') throw new ForbiddenException('Tài khoản đang bị khóa');
    return this.issue(user);
  }
  async refresh(token: string) {
    const hash = hashToken(token);
    const found = await this.db.query(`SELECT rt.id AS token_id, u.* FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE rt.token_hash=$1 AND rt.revoked_at IS NULL AND rt.expires_at>NOW()`, [hash]);
    const user = found.rows[0];
    if (!user || user.status !== 'active') throw new UnauthorizedException('Refresh token không hợp lệ hoặc hết hạn');
    await this.db.query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=$1', [user.token_id]);
    return this.issue(user);
  }
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) await this.db.query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL', [userId, hashToken(refreshToken)]);
    else await this.db.query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL', [userId]);
    return { success: true };
  }
  async me(userId: string) {
    const r = await this.db.query(`SELECT u.id,u.full_name AS "name",u.email,u.avatar_url AS avatar,u.role,u.status,u.created_at,
      COALESCE((SELECT SUM(points) FROM user_points_transactions p WHERE p.user_id=u.id),0)::int AS "greenPoints",
      (SELECT COUNT(*)::int FROM trades t WHERE (t.proposer_id=u.id OR t.receiver_id=u.id) AND t.status='completed') AS "dealCount",
      (SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r JOIN listings l ON l.id=r.listing_id WHERE l.owner_id=u.id) AS rating
      FROM users u WHERE u.id=$1`, [userId]);
    if (!r.rowCount) throw new UnauthorizedException(); return r.rows[0];
  }
}
