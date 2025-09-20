/**
 * 错误处理中间件
 * 统一处理应用中的错误，提供标准化的错误响应格式
 */

/**
 * 全局错误处理中间件
 * @param {Object} ctx - Koa上下文对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 设置HTTP状态码
    ctx.status = err.status || err.statusCode || 500;

    // 设置错误响应体
    ctx.body = {
      error: err.message || "Internal Server Error",
      status: "error",
      timestamp: new Date().toISOString(),
    };

    // 记录错误日志
    console.error("Error occurred:", {
      message: err.message,
      status: ctx.status,
      stack: err.stack,
      url: ctx.url,
      method: ctx.method,
      timestamp: new Date().toISOString(),
    });

    // 触发应用级错误事件
    ctx.app.emit("error", err, ctx);
  }
};

export default errorHandler;
