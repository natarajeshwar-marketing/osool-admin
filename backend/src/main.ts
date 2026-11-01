import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const defaultOrigins = [
    'https://osool.mserve.sa',
    'http://osool.mserve.sa',
  ];
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) =>
        url.trim().replace(/\/+$/, ''),
      )
    : [];
  const frontendUrls = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      const isAllowed =
        frontendUrls.includes(normalizedOrigin) ||
        /^https?:\/\/([a-z0-9-]+\.)*mserve\.sa(:\d+)?$/i.test(normalizedOrigin) ||
        /^http:\/\/localhost:[0-9]+$/.test(normalizedOrigin) ||
        /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(normalizedOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
    credentials: true,
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
