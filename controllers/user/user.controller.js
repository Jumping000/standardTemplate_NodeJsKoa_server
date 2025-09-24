/**
 * 用户控制器
 * 处理用户相关的HTTP请求和响应
 */

import userService from '../../models/user/user.service.js';

/**
 * 用户控制器类
 * 包含所有用户相关的API接口处理方法
 */
class UserController {

  /**
   * 创建新用户
   * POST /api/users
   */
  async createUser(ctx) {
    try {
      const userData = ctx.request.body;
      const result = await userService.createUser(userData);

      if (result.success) {
        ctx.status = 201;
        ctx.body = {
          success: true,
          message: '用户创建成功',
          data: result.data
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message,
          errors: result.errors
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 获取用户列表
   * GET /api/users
   */
  async getUserList(ctx) {
    try {
      const options = {
        page: parseInt(ctx.query.page) || 1,
        limit: parseInt(ctx.query.limit) || 10,
        status: ctx.query.status,
        search: ctx.query.search,
        sortBy: ctx.query.sortBy || 'created_at',
        sortOrder: ctx.query.sortOrder || 'DESC'
      };

      const result = await userService.getUserList(options);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '获取用户列表成功',
          data: result.data,
          pagination: result.pagination
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message,
          errors: result.errors
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 根据ID获取用户详情
   * GET /api/users/:id
   */
  async getUserById(ctx) {
    try {
      const { id } = ctx.params;
      const includePrivate = ctx.query.include_private === 'true';
      
      const result = await userService.getUserById(parseInt(id), includePrivate);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '获取用户信息成功',
          data: result.data
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 根据用户名获取用户信息
   * GET /api/users/username/:username
   */
  async getUserByUsername(ctx) {
    try {
      const { username } = ctx.params;
      const result = await userService.getUserByUsername(username);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '获取用户信息成功',
          data: result.data
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 更新用户信息
   * PUT /api/users/:id
   */
  async updateUser(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      
      const result = await userService.updateUser(parseInt(id), updateData);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '用户信息更新成功',
          data: result.data
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message,
          errors: result.errors
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 删除用户
   * DELETE /api/users/:id
   */
  async deleteUser(ctx) {
    try {
      const { id } = ctx.params;
      const result = await userService.deleteUser(parseInt(id));

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '用户删除成功'
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 用户认证/登录
   * POST /api/users/auth/login
   */
  async authenticateUser(ctx) {
    try {
      const { identifier, password } = ctx.request.body;
      const loginIp = ctx.request.ip;
      
      const result = await userService.authenticateUser(identifier, password, loginIp);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '登录成功',
          data: result.data
        };
      } else {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: result.message,
          errors: result.errors
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 验证用户邮箱
   * POST /api/users/:id/verify-email
   */
  async verifyEmail(ctx) {
    try {
      const { id } = ctx.params;
      const result = await userService.verifyEmail(parseInt(id));

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '邮箱验证成功',
          data: result.data
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 搜索用户
   * GET /api/users/search
   */
  async searchUsers(ctx) {
    try {
      const { keyword } = ctx.query;
      const options = {
        page: parseInt(ctx.query.page) || 1,
        limit: parseInt(ctx.query.limit) || 10,
        sortBy: ctx.query.sortBy || 'username',
        sortOrder: ctx.query.sortOrder || 'ASC'
      };

      if (!keyword) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '搜索关键词不能为空'
        };
        return;
      }

      const result = await userService.searchUsers(keyword, options);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '搜索用户成功',
          data: result.data,
          pagination: result.pagination
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }

  /**
   * 获取用户统计信息
   * GET /api/users/statistics
   */
  async getUserStatistics(ctx) {
    try {
      const result = await userService.getUserStatistics();

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '获取用户统计信息成功',
          data: result.data
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器内部错误',
        error: error.message
      };
    }
  }
}

export default new UserController();