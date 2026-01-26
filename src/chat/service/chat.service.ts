import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model, Types } from "mongoose";
import { ChatMessage } from "../schema/chat.schema";
import { ChatMessageDto } from "../dto/chat.dto";
import { Summary } from "src/summary/schema/summary.schema";
import { Project } from "src/project/schema/project.schema";
import { Meeting } from "src/meeting/schema/meeting.schems";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
    private genAI: GoogleGenerativeAI;

    constructor(
        @InjectModel(ChatMessage.name) private readonly chatMessageModel: Model<ChatMessage>,
        @InjectModel(Summary.name) private readonly summaryModel: Model<Summary>,
        @InjectModel(Project.name) private readonly projectModel: Model<Project>,
        @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
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

            const project = await this.projectModel.findById(chatDto.projectId);
            if (!project) {
                throw new Error(`Projeto com ID ${chatDto.projectId} não encontrado`);
            }

            const meetings = await this.meetingModel.find({
                $or: [
                    { projectId: new Types.ObjectId(chatDto.projectId) },
                    { projectId: chatDto.projectId }
                ]
            }).sort({ date: -1 });

            const meetingIds = meetings.map(m => m._id);
            const meetingIdStrings = meetings.map(m => m._id.toString());
            const summaries = await this.summaryModel.find({
                $or: [
                    { meetingId: { $in: meetingIds } },
                    { meetingId: { $in: meetingIdStrings } }
                ]
            }).sort({ created_at: -1 });

           
            const conversationHistory = await this.chatMessageModel.find({
                conversationId: conversationId
            }).sort({ created_at: 1 }).limit(20);

         
            await this.chatMessageModel.create({
                projectId: new Types.ObjectId(chatDto.projectId),
                conversationId: conversationId,
                role: 'user',
                content: chatDto.message
            });

           
            const response = await this.callGeminiAPI(
                chatDto.message,
                project,
                summaries,
                meetings,
                conversationHistory
            );

            
            const savedResponse = await this.chatMessageModel.create({
                projectId: new Types.ObjectId(chatDto.projectId),
                conversationId: conversationId,
                role: 'assistant',
                content: response
            });

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
                const meeting = meetings.find(m => m._id.toString() === s.meetingId.toString());
                const meetingDate = meeting ? new Date(meeting.date).toLocaleDateString('pt-BR') : 'Data não disponível';
                return `
        ATA ${index + 1} (${meetingDate})
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
        return await this.chatMessageModel.find({
            conversationId: conversationId
        }).sort({ created_at: 1 });
    }

    async getProjectConversations(projectId: string): Promise<any[]> {
        const conversations = await this.chatMessageModel.aggregate([
            { $match: { projectId: new Types.ObjectId(projectId) } },
            { $group: {
                _id: '$conversationId',
                lastMessage: { $last: '$content' },
                lastDate: { $last: '$created_at' },
                messageCount: { $sum: 1 }
            }},
            { $sort: { lastDate: -1 } }
        ]);
        return conversations;
    }

    async deleteConversation(conversationId: string): Promise<void> {
        await this.chatMessageModel.deleteMany({ conversationId: conversationId });
    }
}
