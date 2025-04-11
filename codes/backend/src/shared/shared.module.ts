import type { Provider } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import { CustomLogger } from "./services/custom-logger.service";
import { RequestContextService } from "./services/request-context.service";

const providers: Provider[] = [CustomLogger, RequestContextService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
