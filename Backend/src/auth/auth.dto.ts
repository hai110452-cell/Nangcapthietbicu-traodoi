import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class RegisterDto { @IsString() @MinLength(2) @MaxLength(150) fullName!: string; @IsEmail() @MaxLength(255) email!: string; @IsString() @MinLength(8) @MaxLength(100) password!: string; }
export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }
export class RefreshDto { @IsString() refreshToken!: string; }
