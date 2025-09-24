/**
 * 测试环境设置文件
 * 提供测试数据库配置和通用测试工具
 */

import { sequelize } from '../config/db.config.js';
import User from '../models/user/user.model.js';

/**
 * 设置测试数据库
 * 在每个测试套件开始前初始化数据库
 */
export const setupTestDatabase = async () => {
  try {
    // 同步数据库模型（创建表）
    await sequelize.sync({ force: true });
    console.log('测试数据库初始化成功');
  } catch (error) {
    console.error('测试数据库初始化失败:', error);
    throw error;
  }
};

/**
 * 清理测试数据库
 * 在每个测试套件结束后清理数据库
 */
export const cleanupTestDatabase = async () => {
  try {
    // 清空所有表数据
    await User.destroy({ where: {}, force: true });
    console.log('测试数据库清理成功');
  } catch (error) {
    console.error('测试数据库清理失败:', error);
    throw error;
  }
};

/**
 * 关闭数据库连接
 */
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
    throw error;
  }
};

/**
 * 创建测试用户数据
 */
export const createTestUserData = (overrides = {}) => {
  return {
    username: 'testuser',
    email: 'test@example.com',
    password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', // 模拟的哈希密码
    full_name: '测试用户',
    phone: '13800138000',
    birth_date: '1990-01-01',
    gender: 'male',
    ...overrides
  };
};

/**
 * 创建多个测试用户数据
 */
export const createMultipleTestUsers = (count = 3) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push(createTestUserData({
      username: `testuser${i}`,
      email: `test${i}@example.com`,
      full_name: `测试用户${i}`
    }));
  }
  return users;
};