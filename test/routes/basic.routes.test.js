/**
 * 基础路由测试
 * 测试 basic.routes.js 中的基础路由功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import basicRoutes from '../../routes/basic.routes.js';

describe('基础路由测试', () => {
  let app;
  let server;

  beforeEach(() => {
    app = new Koa();
    app.use(basicRoutes.routes());
    app.use(basicRoutes.allowedMethods());
    server = app.listen();
  });

  describe('GET /', () => {
    it('应该返回欢迎消息', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.text).toBe('欢迎使用 Koa.js API 服务器');
    });

    it('应该设置正确的状态码', async () => {
      const response = await request(server)
        .get('/');

      expect(response.status).toBe(200);
    });

    it('应该返回文本内容', async () => {
      const response = await request(server)
        .get('/');

      expect(response.type).toBe('text/plain');
    });
  });

  describe('路由方法支持', () => {
    it('应该支持 GET 方法', async () => {
      await request(server)
        .get('/')
        .expect(200);
    });

    it('应该拒绝 POST 方法', async () => {
      await request(server)
        .post('/')
        .expect(405); // Method Not Allowed
    });

    it('应该拒绝 PUT 方法', async () => {
      await request(server)
        .put('/')
        .expect(405); // Method Not Allowed
    });

    it('应该拒绝 DELETE 方法', async () => {
      await request(server)
        .delete('/')
        .expect(405); // Method Not Allowed
    });

    it('应该拒绝 PATCH 方法', async () => {
      await request(server)
        .patch('/')
        .expect(405); // Method Not Allowed
    });
  });

  describe('路由匹配', () => {
    it('应该只匹配根路径', async () => {
      await request(server)
        .get('/')
        .expect(200);
    });

    it('应该不匹配其他路径', async () => {
      await request(server)
        .get('/nonexistent')
        .expect(404);
    });

    it('应该不匹配带参数的路径', async () => {
      await request(server)
        .get('/test')
        .expect(404);
    });

    it('应该不匹配子路径', async () => {
      await request(server)
        .get('/api')
        .expect(404);
    });
  });

  describe('响应头测试', () => {
    it('应该设置正确的 Content-Type', async () => {
      const response = await request(server)
        .get('/');

      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });

    it('应该包含 Content-Length 头', async () => {
      const response = await request(server)
        .get('/');

      expect(response.headers['content-length']).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的路径', async () => {
      await request(server)
        .get('/invalid-path')
        .expect(404);
    });

    it('应该处理带查询参数的请求', async () => {
      const response = await request(server)
        .get('/?test=value')
        .expect(200);

      expect(response.text).toBe('欢迎使用 Koa.js API 服务器');
    });

    it('应该处理带 hash 的请求', async () => {
      const response = await request(server)
        .get('/#section')
        .expect(200);

      expect(response.text).toBe('欢迎使用 Koa.js API 服务器');
    });
  });

  describe('路由器实例测试', () => {
    it('应该导出有效的路由器实例', () => {
      expect(basicRoutes).toBeDefined();
      expect(typeof basicRoutes.routes).toBe('function');
      expect(typeof basicRoutes.allowedMethods).toBe('function');
    });

    it('路由器应该有正确的路由配置', () => {
      const routes = basicRoutes.stack;
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('应该包含根路径路由', () => {
      const routes = basicRoutes.stack;
      const rootRoute = routes.find(route => route.path === '/');
      expect(rootRoute).toBeDefined();
      expect(rootRoute.methods).toContain('GET');
    });
  });
});