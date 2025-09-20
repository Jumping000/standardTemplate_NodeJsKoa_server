// 认证中间件
export const authMiddleware = async (ctx, next) => {
  console.log('🔐 认证中间件执行');
  
  const token = ctx.headers.authorization;
  
  if (!token) {
    ctx.status = 401;
    ctx.body = {
      error: '缺少认证令牌',
      status: 'error'
    };
    return; // 不调用next()，中断请求链
  }
  
  // 模拟token验证
  if (token !== 'Bearer valid-token') {
    ctx.status = 401;
    ctx.body = {
      error: '无效的认证令牌',
      status: 'error'
    };
    return;
  }
  
  // 验证通过，添加用户信息到上下文
  ctx.user = {
    id: 1,
    name: 'John Doe',
    role: 'admin'
  };
  
  console.log('✅ 认证通过，用户:', ctx.user.name);
  await next(); // 继续执行下一个中间件或控制器
};

// 可选的认证中间件（不强制要求token）
export const optionalAuthMiddleware = async (ctx, next) => {
  console.log('🔓 可选认证中间件执行');
  
  const token = ctx.headers.authorization;
  
  if (token && token === 'Bearer valid-token') {
    ctx.user = {
      id: 1,
      name: 'John Doe',
      role: 'admin'
    };
    console.log('✅ 用户已认证:', ctx.user.name);
  } else {
    console.log('👤 匿名用户访问');
  }
  
  await next();
};