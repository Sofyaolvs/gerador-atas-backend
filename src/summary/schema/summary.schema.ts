import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';

@Schema()
export class Summary {
    
    _id: Types.ObjectId;

    @Prop({ required: true })
    meetingId: Types.ObjectId;

    @Prop({type: Object, required: true })
    meetingData: any;

    @Prop({ required: true })
    summary: string;

    @Prop({ default: () => new Date() })
    created_at: Date;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);
