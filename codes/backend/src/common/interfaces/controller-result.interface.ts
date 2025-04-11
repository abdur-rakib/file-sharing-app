export interface IControllerResult<T = any> {
  message: string;
  data?: T;
  meta?: Record<string, any>;
}
