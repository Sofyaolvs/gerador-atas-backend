import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ProjectRegistrationDto } from "../dto/project.registration.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "../entity/project.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProjectService {

    constructor(
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>
    ) {}

    async createProject(projectRegistrationDto: ProjectRegistrationDto): Promise<Project> {
        try {
            const newProject = this.projectRepository.create(projectRegistrationDto);
            return await this.projectRepository.save(newProject);
        } catch (error) {
            throw new InternalServerErrorException('Erro ao criar projeto');
        }
    }

    async findAllProjects(): Promise<Project[]>{
        try {
            return await this.projectRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Erro ao buscar todos os projetos');
        }
    }

    async findProjectById(id: string): Promise<Project> {
        try {
            const project = await this.projectRepository.findOneBy({ id });
            if (!project) {
                throw new InternalServerErrorException('Projeto não encontrado');
            }
            return project;
        } catch (error) {
            throw new InternalServerErrorException('Erro ao buscar projeto');
        }
    }

    async deleteProject(id: string): Promise<void> {
        try {
            await this.projectRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Erro ao deletar projeto');
        }
    }
}
