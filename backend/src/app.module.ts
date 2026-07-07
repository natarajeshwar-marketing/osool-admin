import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrewsModule } from './crews/crews.module';
import { BuildingsModule } from './buildings/buildings.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SchedulesModule } from './schedules/schedules.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ServicesModule } from './services/services.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    CrewsModule,
    BuildingsModule,
    UsersModule,
    AuthModule,
    SchedulesModule,
    EnquiriesModule,
    ServicesModule,
    DailyLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
