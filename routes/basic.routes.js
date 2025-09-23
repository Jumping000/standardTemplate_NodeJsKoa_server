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

export default router;
