// 用户控制器 - 包含具体的业务逻辑

// 模拟数据库
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
  { id: 2, name: 'Bob', email: 'bob@example.com', createdAt: new Date() }
];

let nextId = 3;

// 获取所有用户
export const getAllUsers = async (ctx) => {
  console.log('🎯 控制器: 获取所有用户');
  
  // 这里可以访问中间件设置的用户信息
  if (ctx.user) {
    console.log(`👤 请求用户: ${ctx.user.name} (${ctx.user.role})`);
  }
  
  ctx.body = {
    message: '用户列表获取成功',
    data: users,
    total: users.length,
    requestId: ctx.requestId, // 来自中间件的请求ID
    status: 'success'
  };
};

// 根据ID获取用户
export const getUserById = async (ctx) => {
  console.log('🎯 控制器: 根据ID获取用户');
  
  const userId = parseInt(ctx.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      error: '用户不存在',
      status: 'error'
    };
    return;
  }
  
  ctx.body = {
    message: '用户信息获取成功',
    data: user,
    status: 'success'
  };
};

// 创建新用户
export const createUser = async (ctx) => {
  console.log('🎯 控制器: 创建新用户');
  
  // 数据已经通过验证中间件处理过了
  const { name, email } = ctx.request.body;
  
  // 检查邮箱是否已存在
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    ctx.status = 409;
    ctx.body = {
      error: '邮箱已被使用',
      status: 'error'
    };
    return;
  }
  
  const newUser = {
    id: nextId++,
    name,
    email,
    createdAt: new Date(),
    createdBy: ctx.user ? ctx.user.name : '匿名用户'
  };
  
  users.push(newUser);
  
  console.log(`✅ 新用户创建成功: ${newUser.name}`);
  
  ctx.status = 201;
  ctx.body = {
    message: '用户创建成功',
    data: newUser,
    status: 'success'
  };
};

// 更新用户
export const updateUser = async (ctx) => {
  console.log('🎯 控制器: 更新用户');
  
  const userId = parseInt(ctx.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      error: '用户不存在',
      status: 'error'
    };
    return;
  }
  
  const { name, email } = ctx.request.body;
  
  // 检查邮箱是否被其他用户使用
  const existingUser = users.find(u => u.email === email && u.id !== userId);
  if (existingUser) {
    ctx.status = 409;
    ctx.body = {
      error: '邮箱已被其他用户使用',
      status: 'error'
    };
    return;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    updatedAt: new Date(),
    updatedBy: ctx.user ? ctx.user.name : '匿名用户'
  };
  
  console.log(`✅ 用户更新成功: ${users[userIndex].name}`);
  
  ctx.body = {
    message: '用户更新成功',
    data: users[userIndex],
    status: 'success'
  };
};

// 删除用户
export const deleteUser = async (ctx) => {
  console.log('🎯 控制器: 删除用户');
  
  const userId = parseInt(ctx.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      error: '用户不存在',
      status: 'error'
    };
    return;
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  
  console.log(`🗑️ 用户删除成功: ${deletedUser.name}`);
  
  ctx.body = {
    message: '用户删除成功',
    data: deletedUser,
    status: 'success'
  };
};

// 需要管理员权限的控制器示例
export const getAdminStats = async (ctx) => {
  console.log('🎯 控制器: 获取管理员统计信息');
  
  // 检查用户权限（依赖认证中间件设置的用户信息）
  if (!ctx.user || ctx.user.role !== 'admin') {
    ctx.status = 403;
    ctx.body = {
      error: '需要管理员权限',
      status: 'error'
    };
    return;
  }
  
  ctx.body = {
    message: '管理员统计信息',
    data: {
      totalUsers: users.length,
      recentUsers: users.filter(u => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(u.createdAt) > dayAgo;
      }).length,
      requestCount: ctx.requestId
    },
    status: 'success'
  };
};