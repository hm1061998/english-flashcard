import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let detail = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = typeof res === 'string' ? res : res.message || message;
    } else if (exception instanceof QueryFailedError) {
      // Handle Database Errors specifically
      status = HttpStatus.BAD_REQUEST;
      message = 'Thao tác dữ liệu thất bại';
      
      const dbError = exception as any;
      // PostgreSQL Error Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
      if (dbError.code === '23502') {
        message = 'Thiếu thông tin bắt buộc (Người dùng không xác định)';
      } else if (dbError.code === '23505') {
        message = 'Dữ liệu này đã tồn tại trong hệ thống';
      }
      
      detail = dbError.detail || dbError.message;
      this.logger.error(`Database Error [${dbError.code}]: ${detail}`);
    } else {
      this.logger.error(`Unexpected Error: ${(exception as Error).message}`, (exception as Error).stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      error: detail || (exception as any).message || 'Unknown Error',
    });
  }
}
