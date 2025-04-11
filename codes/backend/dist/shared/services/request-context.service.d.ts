export declare class RequestContextService {
    private readonly asyncLocalStorage;
    run(callback: () => void, context: Map<string, any>): void;
    set(key: string, value: any): void;
    get(key: string): any;
}
