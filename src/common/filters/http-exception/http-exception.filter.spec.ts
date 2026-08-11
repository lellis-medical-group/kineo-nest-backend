import { describe, expect, it } from 'bun:test';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('should be defined', () => {
    const httpAdapterHost = new HttpAdapterHost();
    expect(new HttpExceptionFilter(httpAdapterHost)).toBeDefined();
  });
});