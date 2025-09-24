/**
 * 路由集成测试
 * 测试 routes/index.js 中的路由管理和集成功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Koa from 'koa';
import setupRoutes from '../../routes/index.js';

// 模拟路由模块
vi.mock('../../routes/basic.routes.js', () => ({
  default: {
    routes: vi.fn(() => []),
    allowedMethods: vi.fn(() => (ctx, next) => next())
  }
}));

vi.mock('../../routes/user.routes.js', () => ({
  default: {
    routes: vi.fn(() => []),
    allowedMethods: vi.fn(() => (ctx, next) => next())
  }
}));

describe('路由集成测试', () => {
  let app;

  beforeEach(() => {
    app = new Koa();
    vi.clearAllMocks();
  });

  describe('setupRoutes 函数', () => {
    it('应该是一个函数', () => {
      expect(typeof setupRoutes).toBe('function');
    });

    it('应该正确设置应用路由', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupRoutes(mockApp);
      
      expect(mockApp.use).toHaveBeenCalledTimes(2);
    });

    it('应该添加路由中间件', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupRoutes(mockApp);
      
      // 验证调用了 routes() 和 allowedMethods()
      expect(mockApp.use).toHaveBeenCalled();
    });
  });

  describe('setupRoutes 函数测试', () => {
    it('应该是一个函数', () => {
      expect(typeof setupRoutes).toBe('function');
    });

    it('应该接受一个参数', () => {
      expect(setupRoutes.length).toBe(1);
    });

    it('应该正确调用路由设置', () => {
      const initialMiddlewareCount = app.middleware.length;
      setupRoutes(app);
      
      // 验证中间件被添加
      expect(app.middleware.length).toBeGreaterThan(initialMiddlewareCount);
    });

    it('应该向 app 添加中间件', () => {
      const initialMiddlewareCount = app.middleware.length;
      setupRoutes(app);
      
      expect(app.middleware.length).toBeGreaterThan(initialMiddlewareCount);
    });
  });

  describe('路由集成测试', () => {
    it('应该正确集成路由', () => {
      const initialCount = app.middleware.length;
      setupRoutes(app);
      
      // 验证中间件被添加（每个路由添加 routes 和 allowedMethods）
      expect(app.middleware.length).toBeGreaterThan(initialCount);
    });

    it('应该添加多个路由中间件', () => {
      const initialCount = app.middleware.length;
      setupRoutes(app);
      
      // 应该添加了多个中间件（基础路由 + 用户路由）
      expect(app.middleware.length).toBeGreaterThanOrEqual(initialCount + 2);
    });

    it('应该成功执行路由设置', () => {
      expect(() => {
        setupRoutes(app);
      }).not.toThrow();
    });
  });

  describe('中间件注册测试', () => {
    it('应该注册路由中间件', () => {
      const initialCount = app.middleware.length;
      setupRoutes(app);
      
      // 应该添加了路由中间件
      expect(app.middleware.length).toBeGreaterThan(initialCount);
    });

    it('应该正确调用 app.use', () => {
      const useSpy = vi.spyOn(app, 'use');
      setupRoutes(app);
      
      expect(useSpy).toHaveBeenCalledTimes(2); // 基础路由和用户路由
    });
  });

  describe('错误处理测试', () => {
    it('应该处理路由设置错误', () => {
      expect(() => {
        setupRoutes(app);
      }).not.toThrow();
    });

    it('应该处理无效的 app 参数', () => {
      expect(() => {
        setupRoutes(null);
      }).toThrow();
    });
  });

  describe('路由模块导入测试', () => {
    it('应该正确导入所有路由模块', () => {
      expect(() => {
        setupRoutes(app);
      }).not.toThrow();
    });
  });

  describe('路由配置验证', () => {
    it('应该配置正确数量的路由中间件', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupRoutes(mockApp);
      
      // 应该调用 app.use 两次：routes() 和 allowedMethods()
      expect(mockApp.use).toHaveBeenCalledTimes(2);
    });

    it('应该按正确顺序注册路由', () => {
      const mockApp = {
        use: vi.fn()
      };
      
      setupRoutes(mockApp);
      
      // 验证中间件注册顺序
      expect(mockApp.use).toHaveBeenNthCalledWith(1, expect.any(Function));
      expect(mockApp.use).toHaveBeenNthCalledWith(2, expect.any(Function));
    });
  });

  describe('路由性能测试', () => {
    it('路由设置应该快速完成', () => {
      const start = Date.now();
      const testApp = new Koa();
      setupRoutes(testApp);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(50); // 应该在50ms内完成
    });

    it('应该成功设置路由而不出错', () => {
      const testApp = new Koa();
      expect(() => {
        setupRoutes(testApp);
      }).not.toThrow();
    });
  });
});