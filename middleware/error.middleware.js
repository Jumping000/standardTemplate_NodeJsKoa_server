export const errorHandler = async (ctx, next) => {
    try {
        // 继续执行后续中间件
        await next();
    } catch (err) {
        // 设置默认状态码和错误信息
        ctx.status = err.status || err.statusCode || 500;
        ctx.body = {
            success: false,
            message: err.message || 'Internal Server Error',
        };

        // 可选：记录错误日志（如接入日志系统）
        console.error('❌ [Error Handler] Unhandled Error:', err);

        // 触发 Koa 的 error 事件（可用于全局监听）
        ctx.app.emit('error', err, ctx);
    }
};