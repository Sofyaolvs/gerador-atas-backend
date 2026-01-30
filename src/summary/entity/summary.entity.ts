import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../project/entity/project.entity';
import { Meeting } from '../../meeting/entity/meeting.entity';

@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  meetingId: string;

  @ManyToOne(() => Meeting, { nullable: true })
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column('jsonb', { nullable: true })
  meetingData: any;

  @Column('text')
  summary: string;

  @Column({ default: 'generated' })
  sourceType: string;

  @Column({ nullable: true })
  originalFileName: string;

  @Column({ nullable: true })
  meetingDate: Date;

  @Column('text', { array: true, nullable: true })
  participants: string[];

  @CreateDateColumn()
  created_at: Date;
}
