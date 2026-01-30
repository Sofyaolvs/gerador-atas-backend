import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./controller/chat.controller";
import { ChatService } from "./service/chat.service";
import { ChatMessage } from "./entity/chat-message.entity";
import { Summary } from "../summary/entity/summary.entity";
import { Project } from "../project/entity/project.entity";
import { Meeting } from "../meeting/entity/meeting.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatMessage, Summary, Project, Meeting]),
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}
