import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Summary } from "../schema/summary.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SummaryDto } from "../dto/summary.dto";
import { UploadSummaryDto } from "../dto/upload-summary.dto";
import { Meeting } from "src/meeting/schema/meeting.schems";
import { Project } from "src/project/schema/project.schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";

@Injectable()
export class SummaryService {

    private genAI: GoogleGenerativeAI;

    constructor(
        @InjectModel(Summary.name) private readonly summaryModel: Model<Summary>,
        @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
        @InjectModel(Project.name) private readonly projectModel: Model<Project>,
        private readonly configService: ConfigService
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey && apiKey !== '') {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async generateSummary(summaryDto: SummaryDto): Promise<Summary>{
        try {
            const meeting = await this.meetingModel.findById(summaryDto.meetingId)

            if(!meeting){
                throw new Error(`Meeting with ID ${summaryDto.meetingId} not found`);
            }

            // Buscar dados do projeto
            const project = await this.projectModel.findById(meeting.projectId);
            const projectData = project ? {
                name: project.name,
                description: project.description
            } : null;

            // Buscar atas anteriores do mesmo projeto
            const previousMeetings = await this.meetingModel.find({
                projectId: meeting.projectId,
                _id: { $ne: meeting._id }
            }).sort({ date: -1 });

            const previousMeetingIds = previousMeetings.map(m => m._id);
            const previousSummaries = await this.summaryModel.find({
                meetingId: { $in: previousMeetingIds }
            }).sort({ created_at: -1 }).limit(3);

            const meetingJson = {
                projectId: meeting.projectId,
                participants: meeting.participants,
                date: meeting.date,
                topics: meeting.topics,
                pending_tasks: meeting.pending_tasks,
            }

            const generatedSummary = await this.callGeminiAPI(meetingJson, projectData, previousSummaries)

            const newSummary = new this.summaryModel({
                meetingId: new Types.ObjectId(summaryDto.meetingId),
                projectId: meeting.projectId,
                meetingData: meetingJson,
                summary: generatedSummary,
                sourceType: 'generated'
            })
            return await this.summaryModel.create(newSummary)
        } catch (error) {
            console.log(error)
            throw new Error(`Erro ao gerar ata de reunião: ${error.message}`);
        }
    }

    private async callGeminiAPI(
        meetingData: any,
        projectData: { name: string; description: string } | null,
        previousSummaries: Summary[]
    ): Promise<string> {
        if (!this.genAI) {
            throw new Error('Gemini API key não configurada. Configure a variável GEMINI_API_KEY no arquivo .env');
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const projectSection = projectData
            ? `Projeto: ${projectData.name}
Descrição do Projeto: ${projectData.description}

`
            : '';

        let previousSummariesSection = '';
        if (previousSummaries.length > 0) {
            previousSummariesSection = `
Atas Anteriores do Projeto (para contexto e continuidade):
${previousSummaries.map((s, index) => `
--- Ata ${index + 1} ---
${s.summary}
`).join('\n')}

`;
        }

        const prompt = `
Você é um assistente especializado em criar atas de reunião profissionais, objetivas e bem estruturadas.

Com base nas seguintes informações da reunião, gere uma ata formal e clara:

${projectSection}Dados da Reunião:

Data: ${meetingData.date}
Participantes: ${Array.isArray(meetingData.participants) ? meetingData.participants.join(', ') : meetingData.participants}
Tópicos Discutidos: ${meetingData.topics}
Tarefas Pendentes: ${meetingData.pending_tasks}
${previousSummariesSection}
Instruções:
1. Gere uma ata formal contendo cabeçalho e corpo
2. Inclua o nome do projeto no cabeçalho da ata
3. Liste apenas os participantes (não incluir ausentes)
4. Organize os tópicos discutidos de forma clara, objetiva e profissional
5. Liste as tarefas pendentes com seus respectivos responsáveis, quando informados
6. Inclua uma seção de Próximos Passos, se aplicável
7. Se houver atas anteriores, considere o contexto e a continuidade das discussões e tarefas pendentes
8. Não incluir assinaturas, encerramento, horário ou local
Utilize português brasileiro e formatação profissional
Gere a ata de reunião:
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    }

    async findAllSummary():Promise<Summary[]>{
        try {
            return await this.summaryModel.find()
        } catch (error) {
            throw new Error(`Erro ao buscar atas de reunião: ${error.message}`);
        }
    }

    async findSummaryById(id:string):Promise<Summary|null>{
        try {
            const summary = this.summaryModel.findById(id)
            if(!summary){
                throw new Error(`Summary with ID ${id} not found`);
            }
            return summary
        } catch (error) {
            throw new Error(`Erro ao buscar ata de reunião: ${error.message}`);
        }
    }

    async deleteSummary(id:string):Promise<void>{
        try {
            await this.summaryModel.findByIdAndDelete(id)
        } catch (error) {
            throw new Error(`Erro ao deletar ata de reunião: ${error.message}`);
        }
    }

    async uploadSummary(
        file: Express.Multer.File,
        uploadDto: UploadSummaryDto
    ): Promise<Summary> {
        try {
            const project = await this.projectModel.findById(uploadDto.projectId);
            if (!project) {
                throw new Error(`Projeto com ID ${uploadDto.projectId} não encontrado`);
            }

            const extractedText = await this.extractTextFromFile(file);

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('Não foi possível extrair texto do arquivo');
            }

            const newSummary = new this.summaryModel({
                projectId: new Types.ObjectId(uploadDto.projectId),
                summary: extractedText,
                sourceType: 'uploaded',
                originalFileName: file.originalname,
                meetingDate: uploadDto.meetingDate ? new Date(uploadDto.meetingDate) : undefined,
                participants: uploadDto.participants || []
            });

            return await this.summaryModel.create(newSummary);
        } catch (error) {
            throw new Error(`Erro ao fazer upload da ata: ${error.message}`);
        }
    }

    private async extractTextFromFile(file: Express.Multer.File): Promise<string> {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

        switch (fileExtension) {
            case 'pdf':
                return this.extractTextFromPdf(file.buffer);
            case 'docx':
                return this.extractTextFromDocx(file.buffer);
            case 'txt':
                return file.buffer.toString('utf-8');
            default:
                throw new Error(`Formato de arquivo não suportado: ${fileExtension}. Use PDF, DOCX ou TXT.`);
        }
    }

    private async extractTextFromPdf(buffer: Buffer): Promise<string> {
        const pdf = new PDFParse({ data: buffer });
        const result = await pdf.getText();
        await pdf.destroy();
        return result.text;
    }

    private async extractTextFromDocx(buffer: Buffer): Promise<string> {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }
}