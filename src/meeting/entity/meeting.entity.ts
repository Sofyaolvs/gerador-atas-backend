import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../project/entity/project.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column('text', { array: true })
  participants: string[];

  @Column()
  date: Date;

  @Column('text')
  topics: string;

  @Column('text')
  pending_tasks: string;

  @Column({ nullable: true })
  titulo: string;

  @Column('text', { nullable: true })
  conclusoes: string;

  @CreateDateColumn()
  created_at: Date;
}
