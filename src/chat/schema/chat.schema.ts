import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class ChatMessage extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ required: true })
    conversationId: string;

    @Prop({ required: true })
    role: string; 

    @Prop({ required: true })
    content: string;

    @Prop({ default: Date.now })
    created_at: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
