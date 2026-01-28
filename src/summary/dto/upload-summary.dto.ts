import { IsNotEmpty, IsString, IsOptional, IsArray, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadSummaryDto {
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    @IsDate()
    meetingDate?: Date;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    participants?: string[];
}
