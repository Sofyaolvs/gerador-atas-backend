import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { MeetingDto } from "../dto/meeting.dto";
import { MeetingService } from "../service/meeting.service";

@Controller('meeting')
export class MeetingController {
    constructor(private readonly meetingService: MeetingService) {}

    @Post()
    @HttpCode(201)
    async createMeeting(@Body() meetingDto: MeetingDto ){
        try {
            return await this.meetingService.createMeeting(meetingDto)
        } catch (error) {
            throw new Error('Erro ao criar reunião')
        }
    }

    @Get()
    @HttpCode(200)
    async getMeetings(){
        try {
            return await this.meetingService.getAllMeetings();
        } catch (error) {
            throw new Error('Erro ao buscar reuniões');
        }
    }
    
    @Get(':id')
    @HttpCode(200)
    async getMeetingById(@Param('id') id: string){
        try {
            return await this.meetingService.getMeetingById(id);
        } catch (error) {
            throw new Error('Erro ao buscar reunião');
        }
    }

    @Delete(':id')
    @HttpCode(204)
    async deleteMeeting(@Param('id') id: string){
        try {
            return await this.meetingService.deleteMeeting(id);
        } catch (error) {
            throw new Error('Erro ao deletar reunião');
        }
    }
    

}
