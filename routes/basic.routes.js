/**
 * 基础路由模块
 * 包含应用的基本路由定义
 */

import Router from "@koa/router";

const router = new Router();

/**
 * 根路径路由 - 欢迎页面
 */
router.get("/", async (ctx) => {
  ctx.body = {
    message: "Welcome to Koa.js Server!",
    timestamp: new Date().toISOString(),
    status: "success",
    version: "1.0.0",
  };
});

/**
 * 健康检查路由
 */
router.get("/api/health", async (ctx) => {
  ctx.body = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used:
        Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total:
        Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    },
  };
});

export default router;
