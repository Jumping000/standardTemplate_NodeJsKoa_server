/**
 * 基础路由模块
 * 包含应用的基本路由定义和错误处理示例
 */

import Router from "@koa/router";
import { sendSuccess, sendError } from "../utils/response.util.js";

const router = new Router();

/**
 * 根路径路由 - 欢迎页面
 */
router.get("/", async (ctx) => {
    sendSuccess(ctx, {}, "欢迎使用 Koa.js API 服务器");
});

/**
 * 400错误示例 - 客户端请求错误
 */
router.get("/error/400", async (ctx) => {
    sendError(ctx, "这是一个400错误示例 - 客户端请求错误", 400, 400);
});


/**
 * 500错误示例 - 服务器内部错误
 */
router.get("/error/500", async (ctx) => {
    ctx.throw(500, "这是一个500错误示例 - 服务器内部错误");
});

/**
 * 异步错误示例
 */
router.get("/error/async", async (ctx) => {
    // 模拟异步操作中的错误
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error("这是一个异步错误示例 - 模拟异步操作失败"));
        }, 100);
    });
});

/**
 * 自定义错误示例 - 抛出JavaScript错误
 */
router.get("/error/custom", async (ctx) => {
    // 故意抛出一个错误来测试错误处理中间件的捕获和处理能力
    throw new Error("这是一个自定义错误示例 - 模拟业务逻辑中的异常");
});

export default router;
