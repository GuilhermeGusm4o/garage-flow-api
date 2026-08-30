import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  type ArgumentsHost,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { DomainError } from '@common/errors/domain.error';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let request: Request;
  let host: ArgumentsHost;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    filter = new GlobalExceptionFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    request = { method: 'GET', url: '/test' } as Request;

    const response = { status } as unknown as Response;
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the status and message from an HTTP exception', () => {
    filter.catch(new NotFoundException('Resource not found'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Resource not found',
        path: '/test',
      }),
    );
  });

  it('preserves validation messages returned as an array', () => {
    const exception = new BadRequestException({
      message: ['name should not be empty', 'email must be an email'],
    });

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['name should not be empty', 'email must be an email'],
      }),
    );
  });

  it('returns domain errors as bad requests', () => {
    filter.catch(new DomainError('Invalid quantity'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid quantity',
      }),
    );
  });

  it('hides unexpected error details and returns an internal server error', () => {
    filter.catch(new Error('Database connection details'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
    expect(json).not.toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Database connection details' }),
    );
  });

  it('logs 5xx HTTP exceptions as errors instead of warnings', () => {
    const logErrorSpy = jest.spyOn(Logger.prototype, 'error');

    filter.catch(new InternalServerErrorException('Something broke'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('500'), expect.anything());
  });

  it('returns a plain string HTTP exception response as-is', () => {
    filter.catch(new HttpException('Forbidden action', HttpStatus.FORBIDDEN), host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Forbidden action',
      }),
    );
  });

  it('returns an internal server error for unknown thrown values', () => {
    filter.catch('unexpected value', host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });
});
