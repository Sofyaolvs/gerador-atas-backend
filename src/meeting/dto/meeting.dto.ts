import { IsArray, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class MeetingDto {

    @IsString()
    @IsNotEmpty()
    projectId: string;
    
    @IsString({ each: true })
    @IsNotEmpty()
    @IsArray()
    participants:string[];
    
    @IsDateString()
    date: Date;
    
    @IsString()
    topics: string;
    
    @IsString()
    pending_tasks: string;
 
}
