/**
 * 统一响应格式工具模块
 * 提供标准化的API响应格式
 */

/**
 * 发送成功响应
 * @param {Object} ctx - Koa上下文对象
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} code - 特征码，默认200
 * @param {number} httpStatus - HTTP状态码，默认200
 */
export const sendSuccess = (ctx, data = null, message = "操作成功", code = 200, httpStatus = 200) => {
    ctx.status = httpStatus;
    ctx.type = "application/json";
    ctx.body = {
        code,
        message,
        timestamp: new Date().toISOString(),
        path: ctx.url,
        data
    };
};

/**
 * 发送错误响应
 * @param {Object} ctx - Koa上下文对象
 * @param {string} message - 错误消息
 * @param {number} code - 错误特征码
 * @param {number} httpStatus - HTTP状态码，默认500
 * @param {*} data - 错误详细数据（可选）
 */
export const sendError = (ctx, message = "操作失败", code = 500, httpStatus = 500, data = null) => {
    ctx.status = httpStatus;
    ctx.type = "application/json";
    ctx.body = {
        code,
        message,
        timestamp: new Date().toISOString(),
        path: ctx.url,
        data
    };
};

/**
 * 根据HTTP状态码获取默认错误消息
 * @param {number} status - HTTP状态码
 * @returns {string} 错误消息
 */
export const getDefaultErrorMessage = (status) => {
    const statusMessages = {
        400: "请求参数错误",
        401: "未授权访问",
        403: "禁止访问",
        404: "请求的资源不存在",
        405: "请求方法不被允许",
        409: "请求冲突",
        422: "请求参数验证失败",
        429: "请求过于频繁",
        500: "服务器内部错误",
        502: "网关错误",
        503: "服务暂时不可用",
        504: "网关超时"
    };

    return statusMessages[status] || "未知错误";
};