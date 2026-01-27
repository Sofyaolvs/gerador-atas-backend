import { IsNotEmpty, IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class UploadSummaryDto {
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @IsOptional()
    @IsDateString()
    meetingDate?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    participants?: string[];
}
