import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Meeting } from "../schema/meeting.schems";
import { MeetingDto } from "../dto/meeting.dto";

@Injectable()
export class MeetingService {
    constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>
    ){}

    async createMeeting(meetingDto: MeetingDto):Promise<Meeting>{
        try {
            const newMeeting = new  this.meetingModel(meetingDto)
            return await this.meetingModel.create(newMeeting)
        } catch (error) {
            console.error(error)
            throw new Error('Erro ao criar reunião')
        }
    }

    async getMeetingById(id: string):Promise<Meeting>{
        try {
            const meeting = await this.meetingModel.findById(id)
            if(!meeting){
                throw new Error('Reunião não encontrada')
            }
            return meeting
        } catch (error) {
            console.error(error)
            throw new Error('Erro ao buscar reunião')
        }
    }

    async getAllMeetings():Promise<Meeting[]>{
        try {
            const meetings = this.meetingModel.find()
            return meetings
        } catch (error) {
            throw new Error('Erro ao buscar reuniões')
        }
    }

    async deleteMeeting(id: string):Promise<void>{
        try {
            await this.meetingModel.findByIdAndDelete(id)
        } catch (error) {
            console.error(error)
            throw new Error('Erro ao deletar reunião')
        }
    }
}
