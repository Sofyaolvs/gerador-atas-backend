import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatController } from "./controller/chat.controller";
import { ChatService } from "./service/chat.service";
import { ChatMessage, ChatMessageSchema } from "./schema/chat.schema";
import { Summary, SummarySchema } from "src/summary/schema/summary.schema";
import { Project, ProjectSchema } from "src/project/schema/project.schema";
import { Meeting, MeetingSchema } from "src/meeting/schema/meeting.schems";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatMessage.name, schema: ChatMessageSchema },
            { name: Summary.name, schema: SummarySchema },
            { name: Project.name, schema: ProjectSchema },
            { name: Meeting.name, schema: MeetingSchema },
        ])
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}
