import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "../service/chat.service";
import { ChatMessageDto } from "../dto/chat.dto";

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    async sendMessage(@Body() chatDto: ChatMessageDto) {
        return await this.chatService.sendMessage(chatDto);
    }

    @Get('conversation/:conversationId')
    async getConversationHistory(@Param('conversationId') conversationId: string) {
        return await this.chatService.getConversationHistory(conversationId);
    }

    @Get('project/:projectId')
    async getProjectConversations(@Param('projectId') projectId: string) {
        return await this.chatService.getProjectConversations(projectId);
    }

    @Delete('conversation/:conversationId')
    async deleteConversation(@Param('conversationId') conversationId: string) {
        return await this.chatService.deleteConversation(conversationId);
    }
}
