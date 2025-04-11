import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    Map<string, any>
  >();

  run(callback: () => void, context: Map<string, any>) {
    this.asyncLocalStorage.run(context, callback);
  }

  set(key: string, value: any) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  get(key: string): any {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.get(key) : undefined;
  }
}
