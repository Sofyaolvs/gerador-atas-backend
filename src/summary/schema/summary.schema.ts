import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';

@Schema()
export class Summary {

    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Meeting', required: false })
    meetingId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
    projectId: Types.ObjectId;

    @Prop({ type: Object, required: false })
    meetingData: any;

    @Prop({ required: true })
    summary: string;

    @Prop({ required: true, enum: ['generated', 'uploaded'], default: 'generated' })
    sourceType: string;

    @Prop({ required: false })
    originalFileName: string;

    @Prop({ required: false })
    meetingDate: Date;

    @Prop({ required: false, type: [String] })
    participants: string[];

    @Prop({ default: () => new Date() })
    created_at: Date;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);
