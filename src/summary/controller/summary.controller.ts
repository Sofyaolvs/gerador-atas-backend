import { Body, Controller, Post, HttpException, HttpStatus, Get, HttpCode, Param, Delete } from "@nestjs/common";
import { SummaryService } from "../service/summary.service";
import { SummaryDto } from "../dto/summary.dto";

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Post()
    @HttpCode(200)
    async generateSummary(@Body() summaryDto: SummaryDto) {
        try {
            const summary = await this.summaryService.generateSummary(summaryDto);
            return {
                success: true,
                data: summary
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    @HttpCode(200)
    async findAllSummary(){
        try {
            return await this.summaryService.findAllSummary();
        } catch (error) {
            throw new Error('Erro ao buscar atas de reunião.');
        }
    }

    @Get(':id')
    async findSummaryById(@Param('id') id: string){
        try {
            return await this.summaryService.findSummaryById(id);
        } catch (error) {
            throw new Error('Erro ao buscar ata de reunião.');
        }
    }

    @Delete(':id')
    @HttpCode(200)
    async deleteSummary(@Param('id') id:string){
        try {
            return await this.summaryService.deleteSummary(id);
        } catch (error) {
            throw new Error('Erro ao deletar ata de reunião.');
        }
    }
     
}
