import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from './project/project.module';
import { MeetingModule } from './meeting/meeting.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/gerador-atas'),
    ProjectModule,
    MeetingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
