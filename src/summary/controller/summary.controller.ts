import { Body, Controller, Post, HttpException, HttpStatus } from "@nestjs/common";
import { SummaryService } from "../service/summary.service";
import { SummaryDto } from "../dto/summary.dto";

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Post()
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

    
}
