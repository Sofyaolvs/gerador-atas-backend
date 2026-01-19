import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SummaryController } from './controller/summary.controller';
import { SummaryService } from './service/summary.service';
import { Summary, SummarySchema } from './schema/summary.schema';
import { Meeting, MeetingSchema } from 'src/meeting/schema/meeting.schems';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Summary.name, schema: SummarySchema },
      { name: Meeting.name, schema: MeetingSchema },
    ]),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
