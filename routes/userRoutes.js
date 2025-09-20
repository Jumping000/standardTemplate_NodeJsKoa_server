import Router from '@koa/router';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAdminStats
} from '../controllers/userController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { validateUserData, createValidationMiddleware } from '../middleware/validation.js';

const router = new Router({ prefix: '/api/users' });

// 中间件与控制器的组合使用示例

// 1. 公开路由 - 只使用可选认证中间件
router.get('/', optionalAuthMiddleware, getAllUsers);

// 2. 需要认证的路由 - 认证中间件 + 控制器
router.get('/admin/stats', authMiddleware, getAdminStats);

// 3. 单个用户查询 - 可选认证
router.get('/:id', optionalAuthMiddleware, getUserById);

// 4. 创建用户 - 多个中间件链式调用
router.post('/',
  optionalAuthMiddleware,    // 可选认证（记录创建者）
  validateUserData,         // 数据验证
  createUser               // 控制器
);

// 5. 更新用户 - 需要认证 + 验证
router.put('/:id',
  authMiddleware,          // 必须认证
  validateUserData,        // 数据验证
  updateUser              // 控制器
);

// 6. 使用自定义验证中间件的示例
const userValidationSchema = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'string', minLength: 5, maxLength: 100 }
};

router.post('/validated',
  authMiddleware,
  createValidationMiddleware(userValidationSchema),
  createUser
);

// 7. 删除用户 - 需要认证
router.delete('/:id', authMiddleware, deleteUser);

export default router;