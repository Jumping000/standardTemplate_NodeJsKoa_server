// 数据验证中间件
export const validateUserData = async (ctx, next) => {
  console.log('🔍 用户数据验证中间件执行');
  
  if (ctx.method === 'POST' || ctx.method === 'PUT') {
    const { name, email } = ctx.request.body || {};
    
    const errors = [];
    
    // 验证姓名
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('姓名必须是至少2个字符的字符串');
    }
    
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('请提供有效的邮箱地址');
    }
    
    if (errors.length > 0) {
      ctx.status = 400;
      ctx.body = {
        error: '数据验证失败',
        details: errors,
        status: 'error'
      };
      return; // 验证失败，不继续执行
    }
    
    // 清理和标准化数据
    ctx.request.body.name = name.trim();
    ctx.request.body.email = email.toLowerCase().trim();
    
    console.log('✅ 数据验证通过');
  }
  
  await next();
};

// 通用验证中间件工厂函数
export const createValidationMiddleware = (schema) => {
  return async (ctx, next) => {
    console.log('🔍 执行自定义验证');
    
    const data = ctx.request.body;
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      if (rules.required && (!value || value === '')) {
        errors.push(`${field} 是必填字段`);
        continue;
      }
      
      if (value && rules.type && typeof value !== rules.type) {
        errors.push(`${field} 必须是 ${rules.type} 类型`);
      }
      
      if (value && rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} 最少需要 ${rules.minLength} 个字符`);
      }
      
      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} 最多允许 ${rules.maxLength} 个字符`);
      }
    }
    
    if (errors.length > 0) {
      ctx.status = 400;
      ctx.body = {
        error: '数据验证失败',
        details: errors,
        status: 'error'
      };
      return;
    }
    
    console.log('✅ 自定义验证通过');
    await next();
  };
};