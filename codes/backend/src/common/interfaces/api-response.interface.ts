export interface IApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  reason?: string;
  data?: T;
  error?: any;
  errorCharacteristic?: any;
}
