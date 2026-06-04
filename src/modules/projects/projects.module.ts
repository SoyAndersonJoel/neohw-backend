import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsController } from './infrastructure/projects.controller';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { GetUserProjectsUseCase } from './application/use-cases/get-user-projects.use-case';
import { CREATE_PROJECT_USE_CASE, GET_USER_PROJECTS_USE_CASE } from './projects.tokens';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProjectsController],
  providers: [
    {
      provide: CREATE_PROJECT_USE_CASE,
      useClass: CreateProjectUseCase,
    },
    {
      provide: GET_USER_PROJECTS_USE_CASE,
      useClass: GetUserProjectsUseCase,
    },
  ],
})
export class ProjectsModule {}
