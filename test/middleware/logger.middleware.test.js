import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger from '../../middleware/logger.middleware.js';

describe('Logger Middleware', () => {
  let ctx;
  let next;
  let consoleSpy;

  beforeEach(() => {
    // 创建模拟的 Koa 上下文
    ctx = {
      request: {
        method: 'GET',
        url: '/test',
        header: {
          'user-agent': 'test-agent/1.0'
        }
      },
      response: {
        status: 200
      },
      state: {}
    };

    next = vi.fn();
    
    // 模拟 console.log
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // 模拟 Date.now() 和 Date.prototype.toISOString()
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T10:00:00.000Z'));
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.useRealTimers();
  });

  describe('正常请求日志', () => {
    it('应该记录成功的 GET 请求', async () => {
      next.mockResolvedValue();

      await logger(ctx, next);

      expect(next).toHaveBeenCalledOnce();
      expect(ctx.state.requestId).toBeDefined();
      expect(typeof ctx.state.requestId).toBe('string');
      expect(ctx.state.requestId).toHaveLength(8);

      expect(consoleSpy).toHaveBeenCalledOnce();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData).toMatchObject({
        level: 'INFO',
        type: 'REQUEST_COMPLETE',
        method: 'GET',
        url: '/test',
        status: 200,
        userAgent: 'test-agent/1.0'
      });
      expect(logData.requestId).toBeDefined();
      expect(logData.startTimestamp).toBeDefined();
      expect(logData.endTimestamp).toBeDefined();
      expect(logData.duration).toMatch(/^\d+ms$/);
    });

    it('应该记录 POST 请求', async () => {
      ctx.request.method = 'POST';
      ctx.request.url = '/api/users';
      ctx.response.status = 201;
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData).toMatchObject({
        level: 'INFO',
        type: 'REQUEST_COMPLETE',
        method: 'POST',
        url: '/api/users',
        status: 201
      });
    });

    it('应该处理没有 user-agent 的请求', async () => {
      delete ctx.request.header['user-agent'];
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.userAgent).toBe('unknown');
    });

    it('应该截断过长的 user-agent', async () => {
      const longUserAgent = 'a'.repeat(150);
      ctx.request.header['user-agent'] = longUserAgent;
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.userAgent).toHaveLength(100);
      expect(logData.userAgent).toBe('a'.repeat(100));
    });
  });

  describe('不同状态码的日志级别', () => {
    it('应该为 2xx 状态码设置 INFO 级别', async () => {
      ctx.response.status = 200;
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('INFO');
    });

    it('应该为 4xx 状态码设置 WARN 级别', async () => {
      ctx.response.status = 404;
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('WARN');
    });

    it('应该为 5xx 状态码设置 ERROR 级别', async () => {
      ctx.response.status = 500;
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('ERROR');
    });
  });

  describe('错误处理', () => {
    it('应该记录中间件抛出的错误', async () => {
      const error = new Error('Test error');
      next.mockRejectedValue(error);

      await expect(logger(ctx, next)).rejects.toThrow('Test error');

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('ERROR');
      expect(logData.error).toMatchObject({
        message: 'Test error',
        stack: expect.any(String)
      });
    });

    it('应该重新抛出错误以供其他中间件处理', async () => {
      const error = new Error('Test error');
      next.mockRejectedValue(error);

      await expect(logger(ctx, next)).rejects.toThrow('Test error');
      expect(next).toHaveBeenCalledOnce();
    });

    it('应该在错误情况下仍然记录完整日志', async () => {
      const error = new Error('Test error');
      next.mockRejectedValue(error);

      try {
        await logger(ctx, next);
      } catch (e) {
        // 忽略错误，我们只关心日志
      }

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData).toMatchObject({
        level: 'ERROR',
        type: 'REQUEST_COMPLETE',
        method: 'GET',
        url: '/test',
        status: 200
      });
      expect(logData.requestId).toBeDefined();
      expect(logData.duration).toMatch(/^\d+ms$/);
    });
  });

  describe('请求 ID 生成', () => {
    it('应该为每个请求生成唯一的 ID', async () => {
      const requestIds = new Set();
      
      for (let i = 0; i < 10; i++) {
        const newCtx = { ...ctx, state: {} };
        next.mockResolvedValue();
        
        await logger(newCtx, next);
        
        requestIds.add(newCtx.state.requestId);
      }

      expect(requestIds.size).toBe(10); // 所有 ID 都应该是唯一的
    });

    it('应该将请求 ID 添加到上下文状态中', async () => {
      next.mockResolvedValue();

      await logger(ctx, next);

      expect(ctx.state.requestId).toBeDefined();
      expect(typeof ctx.state.requestId).toBe('string');
      expect(ctx.state.requestId).toHaveLength(8);
    });
  });

  describe('时间测量', () => {
    it('应该正确测量请求持续时间', async () => {
      next.mockImplementation(async () => {
        // 模拟 100ms 的处理时间
        vi.advanceTimersByTime(100);
      });

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.duration).toBe('100ms');
    });

    it('应该记录开始和结束时间戳', async () => {
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.startTimestamp).toBe('2024-01-01T10:00:00.000Z');
      expect(logData.endTimestamp).toBe('2024-01-01T10:00:00.000Z');
    });
  });

  describe('JSON 格式输出', () => {
    it('应该输出有效的 JSON 格式', async () => {
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      
      expect(() => JSON.parse(logCall)).not.toThrow();
    });

    it('应该包含所有必需的字段', async () => {
      next.mockResolvedValue();

      await logger(ctx, next);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      const requiredFields = [
        'level', 'type', 'startTimestamp', 'endTimestamp',
        'requestId', 'method', 'url', 'status', 'duration', 'userAgent'
      ];

      requiredFields.forEach(field => {
        expect(logData).toHaveProperty(field);
      });
    });
  });
});