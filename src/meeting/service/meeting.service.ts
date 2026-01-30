import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Meeting } from "../entity/meeting.entity";
import { MeetingDto } from "../dto/meeting.dto";

@Injectable()
export class MeetingService {
    constructor(
        @InjectRepository(Meeting) private readonly meetingRepository: Repository<Meeting>
    ) {}

    async createMeeting(meetingDto: MeetingDto): Promise<Meeting> {
        try {
            const newMeeting = this.meetingRepository.create(meetingDto);
            return await this.meetingRepository.save(newMeeting);
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao criar reunião');
        }
    }

    async getMeetingById(id: string): Promise<Meeting> {
        try {
            const meeting = await this.meetingRepository.findOneBy({ id });
            if (!meeting) {
                throw new Error('Reunião não encontrada');
            }
            return meeting;
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao buscar reunião');
        }
    }

    async getAllMeetings(): Promise<Meeting[]> {
        try {
            return await this.meetingRepository.find();
        } catch (error) {
            throw new Error('Erro ao buscar reuniões');
        }
    }

    async deleteMeeting(id: string): Promise<void> {
        try {
            await this.meetingRepository.delete(id);
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao deletar reunião');
        }
    }
}
