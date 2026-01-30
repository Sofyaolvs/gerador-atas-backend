import { IsArray, IsDate, IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export class MeetingDto {

    @IsString()
    @IsNotEmpty()
    projectId: string;

    @IsString({ each: true })
    @IsNotEmpty()
    @IsArray()
    participants:string[];

    @IsDate()
    @Type(() => Date)
    date: Date;
    
    @IsString()
    topics: string;
    
    @IsString()
    pending_tasks: string;

    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    conclusoes: string;

}
