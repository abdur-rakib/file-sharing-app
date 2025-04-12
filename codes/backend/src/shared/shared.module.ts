import type { Provider } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import { CustomLogger } from "./services/custom-logger.service";
import { RequestContextService } from "./services/request-context.service";
import { DatabaseService } from "../database/database.service";

const providers: Provider[] = [
  CustomLogger,
  RequestContextService,
  DatabaseService,
];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
