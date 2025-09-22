/**
 * 日志中间件
 * 记录请求方法、URL、响应时间、状态码、时间戳和请求ID
 * 使用结构化JSON格式输出
 */

/**
 * 生成请求ID
 * @returns {string} 8位随机字符串
 */
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * 根据状态码确定日志级别
 * @param {number} status - HTTP状态码
 * @returns {string} 日志级别
 */
const getLogLevel = (status) => {
  if (status >= 500) return 'ERROR';
  if (status >= 400) return 'WARN';
  return 'INFO';
};

/**
 * 日志中间件函数
 * @param {Object} ctx - Koa上下文对象
 * @param {Function} next - 下一个中间件函数
 */
const logger = async (ctx, next) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const startTimestamp = new Date().toISOString();
  
  // 将请求ID添加到上下文中，便于其他中间件使用
  ctx.state.requestId = requestId;
  
  const { method, url, header } = ctx.request;
  const userAgent = header['user-agent'] || 'unknown';
  
  let error = null;
  
  try {
    await next();
  } catch (err) {
    error = err;
    throw err; // 重新抛出错误，让错误处理中间件处理
  } finally {
    const endTime = Date.now();
    const endTimestamp = new Date().toISOString();
    const duration = endTime - startTime;
    const { status } = ctx.response;
    const level = error ? 'ERROR' : getLogLevel(status);
    
    // 记录完整的请求日志（合并开始和结束信息）
    const completeLog = {
      level,
      type: 'REQUEST_COMPLETE',
      startTimestamp,
      endTimestamp,
      requestId,
      method,
      url,
      status,
      duration: `${duration}ms`,
      userAgent: userAgent.substring(0, 100) // 限制长度
    };
    
    // 如果有错误，添加错误信息
    if (error) {
      completeLog.error = {
        message: error.message,
        stack: error.stack
      };
    }
    
    console.log(JSON.stringify(completeLog));
  }
};

export default logger;