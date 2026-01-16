import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Types } from 'mongoose';

@Schema()
export class Meeting {

  _id: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref:'Project', require})
  projectId: Types.ObjectId;

  @Prop({ required: true })
  participants: string[];

  @Prop({ required: true})
  date: Date;

  @Prop({ required: true })
  topics: string;

  @Prop({ required: true })
  pending_tasks: string;
  
  @Prop({ default: () => new Date() })
  created_at: Date;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
