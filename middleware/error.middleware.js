/**
 * 错误处理中间件
 * 统一处理应用中的错误，提供标准化的错误响应格式
 */

import { getDefaultErrorMessage } from "../utils/response.util.js";

/**
 * 错误处理中间件
 * 捕获并处理应用中的所有错误
 * @param {Object} ctx - Koa上下文对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        // 记录错误日志
        console.error("❌ 应用错误:", {
            message: error.message,
            stack: error.stack,
            url: ctx.url,
            method: ctx.method,
            timestamp: new Date().toISOString(),
            userAgent: ctx.headers["user-agent"],
            ip: ctx.ip,
        });

        // 设置HTTP状态码
        const httpStatus = error.status || error.statusCode || 500;
        ctx.status = httpStatus;

        // 获取错误消息
        const errorMessage = getErrorMessage(error, httpStatus);

        // 根据错误类型设置响应内容
        const isDevelopment = process.env.NODE_ENV === "development";

        // 准备错误详细数据
        let errorData = null;
        if (isDevelopment) {
            errorData = {
                stack: error.stack,
                originalMessage: error.message,
            };
        }

        // 设置响应头和响应体
        ctx.type = "application/json";
        ctx.body = {
            code: httpStatus,
            message: errorMessage,
            timestamp: new Date().toISOString(),
            path: ctx.url,
            data: errorData
        };

        // 标记错误已被处理，避免应用级错误监听器重复记录
        ctx.state = ctx.state || {};
        ctx.state.errorHandled = true;
    }
};

/**
 * 根据错误状态码获取相应的错误消息
 * @param {Error} error - 错误对象
 * @param {number} status - HTTP状态码
 * @returns {string} 错误消息
 */
const getErrorMessage = (error, status) => {
    // 如果错误对象有自定义消息，优先使用
    if (error.message && error.message !== "Internal Server Error") {
        return error.message;
    }

    // 使用统一的错误消息工具函数
    return getDefaultErrorMessage(status);
};


export default errorHandler;
