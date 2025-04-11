export interface IControllerResult<T = any> {
  message: string;
  data?: T;
}
