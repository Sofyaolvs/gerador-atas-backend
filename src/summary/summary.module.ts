import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryController } from './controller/summary.controller';
import { SummaryService } from './service/summary.service';
import { Summary } from './entity/summary.entity';
import { Meeting } from '../meeting/entity/meeting.entity';
import { Project } from '../project/entity/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Summary, Meeting, Project]),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
