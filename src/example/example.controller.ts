import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('example')
export class ExampleController {
  
  @Get('public')
  publicRoute() {
    return 'This is a public route';
  }

  @UseGuards(RolesGuard)
  @Get('protected')
  protectedRoute() {
    return 'This is a protected route';
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  adminOnlyRoute() {
    return 'This is an admin only route';
  }
}
