import { IsArray, IsDate, IsNotEmpty, IsString } from "class-validator";

export class MeetingDto {

    @IsString()
    @IsNotEmpty()
    projectId: string;
    
    @IsString({ each: true })
    @IsNotEmpty()
    @IsArray()
    participants:string[];
    
    @IsDate()
    date: Date;
    
    @IsString()
    topics: string;
    
    @IsString()
    pending_tasks: string;
 
}
