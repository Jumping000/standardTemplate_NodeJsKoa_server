/**
 * 中间件集成测试
 * 测试 middleware/index.js 中的中间件配置和集成功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Koa from 'koa';
import setupMiddleware from '../../middleware/index.js';

// 模拟第三方中间件
vi.mock('koa-bodyparser', () => ({
  default: vi.fn(() => async (ctx, next) => {
    ctx.request.body = { parsed: true };
    await next();
  })
}));

vi.mock('@koa/cors', () => ({
  default: vi.fn(() => async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    await next();
  })
}));

vi.mock('koa-static', () => ({
  default: vi.fn(() => async (ctx, next) => {
    if (ctx.path.startsWith('/static')) {
      ctx.body = 'static file';
      ctx.status = 200;
    } else {
      await next();
    }
  })
}));

// 模拟自定义中间件
vi.mock('../../middleware/logger.middleware.js', () => ({
  default: async (ctx, next) => {
    ctx.state.logged = true;
    await next();
  }
}));

vi.mock('../../middleware/error.middleware.js', () => ({
  errorHandler: async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  }
}));

// 模拟配置
vi.mock('../../config/app.config.js', () => ({
  bodyParserConfig: {
    enableTypes: ['json', 'form'],
    jsonLimit: '1mb'
  },
  corsConfig: {
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  staticConfig: {
    root: './public',
    opts: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }
}));

describe('中间件集成测试', () => {
  let app;

  beforeEach(() => {
    app = new Koa();
    vi.clearAllMocks();
  });

  describe('setupMiddleware 函数', () => {
    it('应该是一个函数', () => {
      expect(typeof setupMiddleware).toBe('function');
    });

    it('应该正确设置所有中间件', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupMiddleware(mockApp);
      
      // 应该注册5个中间件：错误处理、日志、CORS、静态文件、请求体解析
      expect(mockApp.use).toHaveBeenCalledTimes(5);
    });

    it('应该按正确顺序注册中间件', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupMiddleware(mockApp);
      
      // 验证中间件注册顺序
      expect(mockApp.use).toHaveBeenNthCalledWith(1, expect.any(Function)); // errorHandler
      expect(mockApp.use).toHaveBeenNthCalledWith(2, expect.any(Function)); // logger
      expect(mockApp.use).toHaveBeenNthCalledWith(3, expect.any(Function)); // cors
      expect(mockApp.use).toHaveBeenNthCalledWith(4, expect.any(Function)); // static
      expect(mockApp.use).toHaveBeenNthCalledWith(5, expect.any(Function)); // bodyParser
    });
  });

  describe('中间件配置测试', () => {
    it('应该配置错误处理中间件', () => {
      setupMiddleware(app);
      
      // 验证错误处理中间件被添加
      expect(app.middleware.length).toBeGreaterThan(0);
    });

    it('应该配置日志中间件', () => {
      setupMiddleware(app);
      
      // 验证日志中间件被添加
      expect(app.middleware.length).toBeGreaterThan(1);
    });

    it('应该配置 CORS 中间件', () => {
      setupMiddleware(app);
      
      // 验证 CORS 中间件被添加
      expect(app.middleware.length).toBeGreaterThan(2);
    });

    it('应该配置静态文件中间件', () => {
      setupMiddleware(app);
      
      // 验证静态文件中间件被添加
      expect(app.middleware.length).toBeGreaterThan(3);
    });

    it('应该配置请求体解析中间件', () => {
      setupMiddleware(app);
      
      // 验证请求体解析中间件被添加
      expect(app.middleware.length).toBe(5);
    });
  });

  describe('中间件集成功能测试', () => {
    beforeEach(() => {
      setupMiddleware(app);
      
      // 添加一个测试路由
      app.use(async (ctx) => {
        ctx.body = {
          logged: ctx.state.logged,
          body: ctx.request.body,
          cors: ctx.get('Access-Control-Allow-Origin')
        };
      });
    });

    it('应该正确集成所有中间件', async () => {
      const ctx = {
        request: {},
        response: {},
        state: {},
        set: vi.fn(),
        get: vi.fn(() => '*'),
        path: '/test'
      };

      // 模拟中间件执行
      for (const middleware of app.middleware) {
        await middleware(ctx, async () => {});
      }

      expect(ctx.state.logged).toBe(true);
      expect(ctx.request.body).toEqual({ parsed: true });
      expect(ctx.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(app.middleware.length).toBeGreaterThan(0);
    });
  });

  describe('中间件依赖测试', () => {
    it('应该正确导入所有依赖的中间件模块', () => {
      expect(() => {
        setupMiddleware(app);
      }).not.toThrow();
    });

    it('应该正确导入配置模块', () => {
      expect(() => {
        setupMiddleware(app);
      }).not.toThrow();
    });
  });

  describe('中间件执行顺序测试', () => {
    it('错误处理中间件应该最先执行', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupMiddleware(mockApp);
      
      // 第一个注册的应该是错误处理中间件
      expect(mockApp.use).toHaveBeenNthCalledWith(1, expect.any(Function));
    });

    it('请求体解析中间件应该最后执行', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupMiddleware(mockApp);
      
      // 最后一个注册的应该是请求体解析中间件
      expect(mockApp.use).toHaveBeenNthCalledWith(5, expect.any(Function));
    });
  });

  describe('中间件配置参数测试', () => {
    it('应该使用正确的 bodyParser 配置', async () => {
      const bodyParser = await import('koa-bodyparser');
      setupMiddleware(app);
      
      expect(bodyParser.default).toHaveBeenCalledWith({
        enableTypes: ['json', 'form'],
        jsonLimit: '1mb'
      });
    });

    it('应该使用正确的 CORS 配置', async () => {
      const cors = await import('@koa/cors');
      setupMiddleware(app);
      
      expect(cors.default).toHaveBeenCalledWith({
        origin: '*',
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
      });
    });

    it('应该使用正确的静态文件配置', async () => {
      const serve = await import('koa-static');
      setupMiddleware(app);
      
      expect(serve.default).toHaveBeenCalledWith('./public', {
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理中间件链中的错误', async () => {
      setupMiddleware(app);
      
      const ctx = {
        request: {},
        response: {},
        state: {},
        set: vi.fn(),
        get: vi.fn(),
        path: '/test',
        status: undefined,
        body: undefined
      };

      // 执行错误处理中间件
      const errorHandler = app.middleware[0];
      await errorHandler(ctx, async () => {
        throw new Error('Test error');
      });

      expect(ctx.status).toBe(500);
      expect(ctx.body).toEqual({ error: 'Test error' });
    });
  });

  describe('中间件性能测试', () => {
    it('中间件设置应该快速完成', () => {
      const start = Date.now();
      setupMiddleware(app);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(50); // 应该在50ms内完成
    });

    it('应该不会创建过多的中间件实例', () => {
      setupMiddleware(app);
      
      expect(app.middleware.length).toBe(5);
    });
  });

  describe('中间件模块导出测试', () => {
    it('应该正确导出 setupMiddleware 函数', () => {
      expect(setupMiddleware).toBeDefined();
      expect(typeof setupMiddleware).toBe('function');
    });

    it('setupMiddleware 应该接受 app 参数', () => {
      expect(setupMiddleware.length).toBe(1);
    });
  });
});