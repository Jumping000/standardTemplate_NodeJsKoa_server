// 日志中间件
export const loggerMiddleware = async (ctx, next) => {
  const start = Date.now();
  const method = ctx.method;
  const url = ctx.url;
  
  console.log(`📝 [${new Date().toISOString()}] ${method} ${url} - 开始处理`);
  
  try {
    await next(); // 执行下一个中间件或控制器
    
    const duration = Date.now() - start;
    const status = ctx.status;
    
    console.log(`✅ [${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - start;
    
    console.error(`❌ [${new Date().toISOString()}] ${method} ${url} - 错误 - ${duration}ms`);
    console.error('错误详情:', error.message);
    
    // 重新抛出错误，让错误处理中间件处理
    throw error;
  }
};

// 请求计数中间件
let requestCount = 0;

export const requestCounterMiddleware = async (ctx, next) => {
  requestCount++;
  ctx.requestId = requestCount;
  
  console.log(`📊 请求编号: #${requestCount}`);
  
  await next();
};