import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../middleware/error.middleware.js';

describe('Error Middleware', () => {
  let ctx;
  let next;
  let mockApp;

  beforeEach(() => {
    // 创建模拟的 Koa 上下文
    mockApp = {
      emit: vi.fn()
    };

    ctx = {
      status: 200,
      body: null,
      app: mockApp
    };

    next = vi.fn();
  });

  describe('正常流程', () => {
    it('应该正常执行下一个中间件', async () => {
      next.mockResolvedValue();

      await errorHandler(ctx, next);

      expect(next).toHaveBeenCalledOnce();
      expect(ctx.status).toBe(200);
      expect(ctx.body).toBeNull();
    });

    it('应该保持原有的响应状态和内容', async () => {
      ctx.status = 201;
      ctx.body = { success: true, data: 'test' };
      next.mockResolvedValue();

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(201);
      expect(ctx.body).toEqual({ success: true, data: 'test' });
    });
  });

  describe('错误处理', () => {
    it('应该捕获并处理带有状态码的错误', async () => {
      const error = new Error('Test error');
      error.status = 400;
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(400);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Test error'
      });
      expect(consoleSpy).toHaveBeenCalledWith('❌ [Error Handler] Unhandled Error:', error);
      expect(mockApp.emit).toHaveBeenCalledWith('error', error, ctx);

      consoleSpy.mockRestore();
    });

    it('应该处理带有 statusCode 属性的错误', async () => {
      const error = new Error('Status code error');
      error.statusCode = 422;
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(422);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Status code error'
      });

      consoleSpy.mockRestore();
    });

    it('应该为没有状态码的错误设置默认状态码 500', async () => {
      const error = new Error('Generic error');
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Generic error'
      });

      consoleSpy.mockRestore();
    });

    it('应该为没有消息的错误设置默认消息', async () => {
      const error = new Error();
      error.status = 404;
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(404);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Internal Server Error'
      });

      consoleSpy.mockRestore();
    });

    it('应该处理非 Error 对象的异常', async () => {
      const error = 'String error';
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Internal Server Error'
      });

      consoleSpy.mockRestore();
    });

    it('应该触发应用的错误事件', async () => {
      const error = new Error('Event test error');
      error.status = 403;
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(mockApp.emit).toHaveBeenCalledWith('error', error, ctx);
      expect(mockApp.emit).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('应该记录错误日志', async () => {
      const error = new Error('Log test error');
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(consoleSpy).toHaveBeenCalledWith('❌ [Error Handler] Unhandled Error:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('边界情况', () => {
    it('应该处理 null 错误', async () => {
      next.mockRejectedValue(null);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Internal Server Error'
      });

      consoleSpy.mockRestore();
    });

    it('应该处理 undefined 错误', async () => {
      next.mockRejectedValue(undefined);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Internal Server Error'
      });

      consoleSpy.mockRestore();
    });

    it('应该处理状态码为 0 的错误', async () => {
      const error = new Error('Zero status error');
      error.status = 0;
      next.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await errorHandler(ctx, next);

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({
        success: false,
        message: 'Zero status error'
      });

      consoleSpy.mockRestore();
    });
  });
});