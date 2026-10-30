import { BadRequestException, Body, Controller, Module, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';
import { createHash } from 'node:crypto';

class UploadImageDto {
  @IsString() @MaxLength(180) fileName!: string;
  @IsString() @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/avif']) mimeType!: string;
  @IsString() data!: string;
}

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
class UploadsController {
  @Post('images')
  async uploadImage(@Body() dto: UploadImageDto) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) throw new ServiceUnavailableException('Backend chưa được cấu hình Cloudinary. Vui lòng khai báo CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET.');
    const base64 = dto.data.replace(/^data:image\/(jpeg|png|webp|avif);base64,/i, '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new BadRequestException('Dữ liệu ảnh không hợp lệ.');
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new BadRequestException('Ảnh phải có dung lượng tối đa 5 MB.');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'ProjectManager';
    const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
    const form = new FormData();
    form.append('file', `data:${dto.mimeType};base64,${buffer.toString('base64')}`);
    form.append('api_key', apiKey); form.append('timestamp', timestamp); form.append('folder', folder); form.append('signature', signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body: form });
    const result: any = await response.json().catch(() => ({}));
    if (!response.ok || !result.secure_url) throw new BadRequestException(result.error?.message || 'Cloudinary không thể tải ảnh lên.');
    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, bytes: result.bytes };
  }
}
@Module({ controllers: [UploadsController] })
export class UploadsModule {}
