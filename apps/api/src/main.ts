import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SanitizationInterceptor } from './common/interceptors/sanitization.interceptor';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }

  const app = await NestFactory.create(AppModule, { rawBody: true, bufferLogs: true });
  
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(
    new LoggerErrorInterceptor(),
    new SanitizationInterceptor()
  );
  
  // Security Headers
  app.use(helmet());
  
  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Should be set to specific domains in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Global Error Handling
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Algo Matrix API')
    .setDescription('The API documentation for Algo Matrix WABA SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
