import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entity/project.entity';

const PROJECTS = [
  {
    name: 'Iupi',
    description:
      'O Projeto difundir e incentivar a interação dos alunos com as disciplinas através da gameficação visando a estimular e envolver os alunos nas atividades escolares.',
    status: true,
  },
  {
    name: 'Vira',
    description:
      'Plataforma web, cuja a finalidade é registrar e acompanhar o processo de desenvolvimento de projetos, baseado nas demandas de atividade do Vortex.',
    status: true,
  },
  {
    name: 'Orbis',
    description:
      'Inspirado no universo Pokémon, a Pokédex da UNIFOR é um sistema inteligente capaz de identificar os principais animais que habitam o campus da universidade.',
    status: true,
  },
];

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async onModuleInit() {
    await this.seedAll();
  }

  async seedAll() {
    try {
      await this.seedProjects();
      this.logger.log('Seed executado com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao executar seed:', error.message);
    }
  }

  private async seedProjects() {
    for (const project of PROJECTS) {
      const existingProject = await this.projectRepository.findOneBy({
        name: project.name,
      });

      if (existingProject) {
        this.logger.log(`Projeto já existe: ${project.name}`);
        continue;
      }

      await this.projectRepository.save(this.projectRepository.create(project));
      this.logger.log(`Projeto criado com sucesso: ${project.name}`);
    }
  }
}
