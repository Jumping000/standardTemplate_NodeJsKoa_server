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

export default router;
