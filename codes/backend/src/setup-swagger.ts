import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("API Documentation")
    .setDescription("API endpoints for automated PR/PO")
    .setVersion("1.0")
    .addTag("API") // Optional, used to group endpoints in Swagger UI
    .addBearerAuth() // Adds Bearer authentication support
    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup("api-docs", app, document);
}
