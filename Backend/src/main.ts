import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);


    app.setGlobalPrefix('api');

    app.enableCors({
        origin: 'http://localhost:3000', // frontend (Vite) port
    });

    await app.listen(3001); // <-- IMPORTANT: backend on 3001
}
bootstrap();
