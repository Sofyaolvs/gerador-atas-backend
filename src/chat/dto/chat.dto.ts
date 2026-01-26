import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ChatMessageDto {
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsOptional()
    conversationId?: string;
}

export class ChatResponseDto {
    conversationId: string;
    projectId: string;
    message: string;
    response: string;
    created_at: Date;
}
