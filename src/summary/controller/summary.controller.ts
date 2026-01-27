import { Body, Controller, Post, HttpException, HttpStatus, Get, HttpCode, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SummaryService } from "../service/summary.service";
import { SummaryDto } from "../dto/summary.dto";
import { UploadSummaryDto } from "../dto/upload-summary.dto";

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

    @Post('upload')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    async uploadSummary(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), 
                    new FileTypeValidator({ fileType: /(pdf|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|plain)/ }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body() uploadDto: UploadSummaryDto
    ) {
        try {
            const summary = await this.summaryService.uploadSummary(file, uploadDto);
            return {success: true,data: summary};
        } catch (error) {
            throw new HttpException(
                {success: false,message: error.message},
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
