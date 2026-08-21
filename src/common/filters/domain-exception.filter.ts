import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;

      if (status >= 500) {
        this.logger.error(
          `${request.method} ${request.url} - ${status}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      } else {
        this.logger.warn(
          `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
        );
      }

      return response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception instanceof Error) {
      this.logger.warn(`${request.method} ${request.url} - Domain error: ${exception.message}`);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    this.logger.error(`${request.method} ${request.url} - Unknown exception`, exception as any);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
