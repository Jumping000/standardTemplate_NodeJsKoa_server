/**
 * 用户路由模块
 * 定义用户相关的所有API路由
 */

import Router from '@koa/router';
import userController from '../controllers/user/user.controller.js';

const router = new Router({
  prefix: '/api/users'
});

/**
 * 用户认证相关路由
 */
// 用户登录
router.post('/auth/login', userController.authenticateUser);

/**
 * 用户管理相关路由
 */
// 创建新用户
router.post('/', userController.createUser);

// 获取用户列表
router.get('/', userController.getUserList);

// 搜索用户
router.get('/search', userController.searchUsers);

// 获取用户统计信息
router.get('/statistics', userController.getUserStatistics);

// 根据用户名获取用户信息
router.get('/username/:username', userController.getUserByUsername);

// 根据ID获取用户详情
router.get('/:id', userController.getUserById);

// 更新用户信息
router.put('/:id', userController.updateUser);

// 删除用户
router.delete('/:id', userController.deleteUser);

// 验证用户邮箱
router.post('/:id/verify-email', userController.verifyEmail);

export default router;