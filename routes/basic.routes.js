/**
 * 基础路由模块
 * 包含应用的基本路由定义和错误处理示例
 */

import Router from "@koa/router";

const router = new Router();

/**
 * 根路径路由 - 欢迎页面
 */
router.get("/", async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      message: "Welcome to Koa.js Server!",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  };
});

/**
 * 500错误示例 - 服务器内部错误
 */
router.get("/error/500", async (ctx) => {
  ctx.throw(500, "这是一个500错误示例 - 服务器内部错误");
});

/**
 * 自定义错误示例 - 抛出JavaScript错误
 */
router.get("/error/custom", async (ctx) => {
  // 故意抛出一个未捕获的错误来测试错误处理中间件
  throw new Error("这是一个自定义错误示例 - 模拟未预期的异常");
});

export default router;
