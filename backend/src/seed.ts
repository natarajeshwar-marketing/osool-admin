import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123'; // Initial password

  const existingUser = await usersService.findOne(adminEmail);
  if (existingUser) {
    console.log('Super Admin already exists.');
  } else {
    await usersService.create({
      email: adminEmail,
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      name: 'Super Admin',
    });
    console.log(
      `Super Admin created with email: ${adminEmail} and password: ${adminPassword}`,
    );
  }

  // Seed Admin user
  const adminUserEmail = 'admin_user@example.com';
  const adminUserPassword = 'password123';
  const existingAdmin = await usersService.findOne(adminUserEmail);
  if (existingAdmin) {
    console.log('Admin user already exists.');
  } else {
    await usersService.create({
      email: adminUserEmail,
      password: adminUserPassword,
      role: UserRole.ADMIN,
      name: 'Admin User',
    });
    console.log(
      `Admin user created with email: ${adminUserEmail} and password: ${adminUserPassword}`,
    );
  }

  // Seed Editor user
  const editorEmail = 'editor@example.com';
  const editorPassword = 'password123';
  const existingEditor = await usersService.findOne(editorEmail);
  if (existingEditor) {
    console.log('Editor user already exists.');
  } else {
    await usersService.create({
      email: editorEmail,
      password: editorPassword,
      role: UserRole.EDITOR,
      name: 'Editor User',
    });
    console.log(
      `Editor user created with email: ${editorEmail} and password: ${editorPassword}`,
    );
  }

  // Seed Viewer user
  const viewerEmail = 'viewer@example.com';
  const viewerPassword = 'password123';
  const existingViewer = await usersService.findOne(viewerEmail);
  if (existingViewer) {
    console.log('Viewer user already exists.');
  } else {
    await usersService.create({
      email: viewerEmail,
      password: viewerPassword,
      role: UserRole.VIEWER,
      name: 'Viewer User',
    });
    console.log(
      `Viewer user created with email: ${viewerEmail} and password: ${viewerPassword}`,
    );
  }

  await app.close();
}
bootstrap();
