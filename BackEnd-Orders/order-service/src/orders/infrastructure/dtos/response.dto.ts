export class ResponseDto<T> {
    code: number;
    message: string;
    data?: T;
    count?: number;
    error?: string;
    timestamp: string;
  }