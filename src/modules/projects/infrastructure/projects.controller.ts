import { Controller, Post, Get, Body, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '../../users/domain/enums/role.enum';
import { CreateProjectDto } from '../application/dtos/create-project.dto';
import { CREATE_PROJECT_USE_CASE, GET_USER_PROJECTS_USE_CASE } from '../projects.tokens';
import type { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import type { GetUserProjectsUseCase } from '../application/use-cases/get-user-projects.use-case';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectsController {
  constructor(
    @Inject(CREATE_PROJECT_USE_CASE)
    private readonly createProjectUseCase: CreateProjectUseCase,
    @Inject(GET_USER_PROJECTS_USE_CASE)
    private readonly getUserProjectsUseCase: GetUserProjectsUseCase,
  ) {}

  @Post()
  @Roles(Role.USER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN) // USER primarily
  async createProject(@Request() req: any, @Body() dto: CreateProjectDto) {
    const project = await this.createProjectUseCase.execute(req.user.id, dto);
    return {
      message: 'Proyecto de ensamblaje guardado exitosamente',
      project,
    };
  }

  @Get()
  @Roles(Role.USER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async getMyProjects(@Request() req: any) {
    const projects = await this.getUserProjectsUseCase.execute(req.user.id);
    return {
      projects,
    };
  }
}
