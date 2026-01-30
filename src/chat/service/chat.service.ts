import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ChatMessage } from "../entity/chat-message.entity";
import { ChatMessageDto } from "../dto/chat.dto";
import { Summary } from "../../summary/entity/summary.entity";
import { Project } from "../../project/entity/project.entity";
import { Meeting } from "../../meeting/entity/meeting.entity";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
    private genAI: GoogleGenerativeAI;

    constructor(
        @InjectRepository(ChatMessage) private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(Summary) private readonly summaryRepository: Repository<Summary>,
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        @InjectRepository(Meeting) private readonly meetingRepository: Repository<Meeting>,
        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_CHAT_API_KEY');
        if (apiKey && apiKey !== '') {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async sendMessage(chatDto: ChatMessageDto): Promise<any> {
        try {
            const conversationId = chatDto.conversationId || uuidv4();

            const project = await this.projectRepository.findOneBy({ id: chatDto.projectId });
            if (!project) {
                throw new Error(`Projeto com ID ${chatDto.projectId} não encontrado`);
            }

            const meetings = await this.meetingRepository.find({
                where: { projectId: chatDto.projectId },
                order: { date: 'DESC' }
            });

            const summaries = await this.summaryRepository.find({
                where: { projectId: chatDto.projectId },
                order: { created_at: 'DESC' }
            });

            const conversationHistory = await this.chatMessageRepository.find({
                where: { conversationId },
                order: { created_at: 'ASC' },
                take: 20
            });

            await this.chatMessageRepository.save(
                this.chatMessageRepository.create({
                    projectId: chatDto.projectId,
                    conversationId: conversationId,
                    role: 'user',
                    content: chatDto.message
                })
            );

            const response = await this.callGeminiAPI(
                chatDto.message,
                project,
                summaries,
                meetings,
                conversationHistory
            );

            const savedResponse = await this.chatMessageRepository.save(
                this.chatMessageRepository.create({
                    projectId: chatDto.projectId,
                    conversationId: conversationId,
                    role: 'assistant',
                    content: response
                })
            );

            return {
                conversationId: conversationId,
                projectId: chatDto.projectId,
                message: chatDto.message,
                response: response,
                created_at: savedResponse.created_at
            };
        } catch (error) {
            console.error('Erro no chat:', error);
            throw new Error(`Erro ao processar mensagem: ${error.message}`);
        }
    }

    private async callGeminiAPI(
        userMessage: string,
        project: Project,
        summaries: Summary[],
        meetings: Meeting[],
        conversationHistory: ChatMessage[]
    ): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let atasContext = '';
        if (summaries.length > 0) {
            atasContext = summaries.map((s, index) => {
                const meeting = s.meetingId ? meetings.find(m => m.id === s.meetingId) : null;
                const meetingDate = s.meetingDate
                    ? new Date(s.meetingDate).toLocaleDateString('pt-BR')
                    : meeting ? new Date(meeting.date).toLocaleDateString('pt-BR')
                    : 'Data não disponível';
                const source = s.sourceType === 'uploaded' ? ` [Upload: ${s.originalFileName || 'arquivo'}]` : '';
                return `
        ATA ${index + 1} (${meetingDate})${source}
        ${s.summary}
        `;
            }).join('\n');
        } else {
            atasContext = 'Nenhuma ata disponível para este projeto ainda.';
        }

        let historyContext = '';
        if (conversationHistory.length > 0) {
            historyContext = `
        Histórico da conversa:
        ${conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`).join('\n')}
        `;
        }

        const prompt = `
        Você é um assistente especializado em responder perguntas sobre atas de reunião de projetos.
        Você tem acesso a todas as atas do projeto e deve responder perguntas baseando-se APENAS nas informações contidas nelas.

        PROJETO: ${project.name}
        DESCRIÇÃO: ${project.description}

        ATAS DISPONÍVEIS:
        ${atasContext}

        ${historyContext}

        INSTRUÇÕES:
        1. Responda APENAS com base nas informações das atas fornecidas
        2. Se a informação não estiver nas atas, informe educadamente que não encontrou essa informação
        3. Seja objetivo e claro nas respostas
        4. Se houver múltiplas referências ao mesmo assunto em diferentes atas, mencione todas
        5. Cite a data da ata quando relevante para a resposta
        6. Use português brasileiro

        PERGUNTA DO USUÁRIO: ${userMessage}

        RESPOSTA:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    }

    async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
        return await this.chatMessageRepository.find({
            where: { conversationId },
            order: { created_at: 'ASC' }
        });
    }

    async getProjectConversations(projectId: string): Promise<any[]> {
        const conversations = await this.chatMessageRepository
            .createQueryBuilder('msg')
            .select('msg.conversationId', 'conversationId')
            .addSelect('MAX(msg.content)', 'lastMessage')
            .addSelect('MAX(msg.created_at)', 'lastDate')
            .addSelect('COUNT(*)', 'messageCount')
            .where('msg.projectId = :projectId', { projectId })
            .groupBy('msg.conversationId')
            .orderBy('MAX(msg.created_at)', 'DESC')
            .getRawMany();

        return conversations.map(c => ({
            _id: c.conversationId,
            lastMessage: c.lastMessage,
            lastDate: c.lastDate,
            messageCount: parseInt(c.messageCount)
        }));
    }

    async deleteConversation(conversationId: string): Promise<void> {
        await this.chatMessageRepository.delete({ conversationId });
    }
}
