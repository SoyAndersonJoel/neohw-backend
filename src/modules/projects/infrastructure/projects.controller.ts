import { Controller, Post, Get, Body, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '../../users/domain/enums/role.enum';
import { CreateProjectDto } from '../application/dtos/create-project.dto';
import { CREATE_PROJECT_USE_CASE, GET_USER_PROJECTS_USE_CASE } from '../projects.tokens';
import type { CreateProjectUseCase } from '../application/use-cases/create-project.use-case';
import type { GetUserProjectsUseCase } from '../application/use-cases/get-user-projects.use-case';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Guardar un proyecto de ensamblaje de PC' })
  @ApiResponse({ status: 201, description: 'Proyecto guardado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createProject(@Request() req: any, @Body() dto: CreateProjectDto) {
    const project = await this.createProjectUseCase.execute(req.user.id, dto);
    return {
      message: 'Proyecto de ensamblaje guardado exitosamente',
      project,
    };
  }

  @Get()
  @Roles(Role.USER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener los proyectos de ensamblaje guardados del usuario actual' })
  @ApiResponse({ status: 200, description: 'Proyectos obtenidos' })
  async getMyProjects(@Request() req: any) {
    const projects = await this.getUserProjectsUseCase.execute(req.user.id);
    return {
      projects,
    };
  }
}
