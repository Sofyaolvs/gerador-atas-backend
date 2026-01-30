import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingController } from './controller/meeting.controller';
import { MeetingService } from './service/meeting.service';
import { Meeting } from './entity/meeting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting]),
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}
