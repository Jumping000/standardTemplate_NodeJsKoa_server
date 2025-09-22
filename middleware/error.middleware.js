/**
 * 错误处理中间件
 * 统一处理应用中的错误，提供标准化的错误响应格式
 */

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
    ctx.status = error.status || error.statusCode || 500;

    // 根据错误类型设置响应内容
    const isDevelopment = process.env.NODE_ENV === "development";

    // 标准化错误响应格式
    const errorResponse = {
      success: false,
      error: {
        code: ctx.status,
        message: getErrorMessage(error, ctx.status),
        timestamp: new Date().toISOString(),
        path: ctx.url,
      },
    };

    // 开发环境下包含详细错误信息
    if (isDevelopment) {
      errorResponse.error.details = {
        stack: error.stack,
        originalMessage: error.message,
      };
    }

    // 设置响应头
    ctx.type = "application/json";
    ctx.body = errorResponse;

    // 标记错误已被处理，避免应用级错误监听器重复记录
    ctx.state = ctx.state || {};
    ctx.state.errorHandled = true;
  }
};

/**
 * 根据错误状态码获取用户友好的错误消息
 * @param {Error} error - 错误对象
 * @param {number} status - HTTP状态码
 * @returns {string} 错误消息
 */
const getErrorMessage = (error, status) => {
  // 如果错误对象有自定义消息且不是系统错误，使用自定义消息
  if (error.message && status < 500 && !error.message.includes("ENOENT")) {
    return error.message;
  }

  // 根据状态码返回标准错误消息
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
    504: "网关超时",
  };

  return statusMessages[status] || "未知错误";
};

/**
 * 应用级错误事件监听器
 * 用于记录未被中间件捕获的错误
 * @param {Object} app - Koa应用实例
 */
export const setupErrorListener = (app) => {
  app.on("error", (error, ctx) => {
    // 避免重复记录已经在中间件中处理的错误
    if (ctx && (ctx.headerSent || (ctx.state && ctx.state.errorHandled))) {
      return;
    }

    console.error("🔥 未捕获的应用错误:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  });
};

export default errorHandler;
