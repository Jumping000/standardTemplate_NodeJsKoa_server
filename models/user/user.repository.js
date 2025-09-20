import User from './user.model.js';
import { Op } from 'sequelize';

/**
 * 用户数据访问层
 * 提供用户数据的基础CRUD操作
 */
class UserRepository {
  
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<User>} 创建的用户实例
   */
  async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }

  /**
   * 根据ID查找用户
   * @param {number} id - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<User|null>} 用户实例或null
   */
  async findById(id, options = {}) {
    try {
      return await User.findByPk(id, options);
    } catch (error) {
      throw new Error(`根据ID查找用户失败: ${error.message}`);
    }
  }

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @param {Object} options - 查询选项
   * @returns {Promise<User|null>} 用户实例或null
   */
  async findByUsername(username, options = {}) {
    try {
      return await User.findOne({
        where: { username },
        ...options
      });
    } catch (error) {
      throw new Error(`根据用户名查找用户失败: ${error.message}`);
    }
  }

  /**
   * 根据邮箱查找用户
   * @param {string} email - 邮箱地址
   * @param {Object} options - 查询选项
   * @returns {Promise<User|null>} 用户实例或null
   */
  async findByEmail(email, options = {}) {
    try {
      return await User.findOne({
        where: { email: email.toLowerCase() },
        ...options
      });
    } catch (error) {
      throw new Error(`根据邮箱查找用户失败: ${error.message}`);
    }
  }

  /**
   * 根据用户名或邮箱查找用户
   * @param {string} identifier - 用户名或邮箱
   * @param {Object} options - 查询选项
   * @returns {Promise<User|null>} 用户实例或null
   */
  async findByUsernameOrEmail(identifier, options = {}) {
    try {
      return await User.findOne({
        where: {
          [Op.or]: [
            { username: identifier },
            { email: identifier.toLowerCase() }
          ]
        },
        ...options
      });
    } catch (error) {
      throw new Error(`根据用户名或邮箱查找用户失败: ${error.message}`);
    }
  }

  /**
   * 获取用户列表
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码（从1开始）
   * @param {number} options.limit - 每页数量
   * @param {Object} options.where - 查询条件
   * @param {Array} options.order - 排序条件
   * @returns {Promise<Object>} 包含用户列表和分页信息的对象
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        where = {},
        order = [['created_at', 'DESC']],
        ...otherOptions
      } = options;

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        ...otherOptions
      });

      return {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`获取用户列表失败: ${error.message}`);
    }
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<User|null>} 更新后的用户实例或null
   */
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await User.update(updateData, {
        where: { id },
        returning: true
      });

      if (updatedRowsCount === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`更新用户失败: ${error.message}`);
    }
  }

  /**
   * 软删除用户
   * @param {number} id - 用户ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async softDelete(id) {
    try {
      const user = await this.findById(id);
      if (!user) {
        return false;
      }

      await user.destroy();
      return true;
    } catch (error) {
      throw new Error(`软删除用户失败: ${error.message}`);
    }
  }

  /**
   * 硬删除用户
   * @param {number} id - 用户ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async hardDelete(id) {
    try {
      const deletedRowsCount = await User.destroy({
        where: { id },
        force: true
      });

      return deletedRowsCount > 0;
    } catch (error) {
      throw new Error(`硬删除用户失败: ${error.message}`);
    }
  }

  /**
   * 恢复软删除的用户
   * @param {number} id - 用户ID
   * @returns {Promise<User|null>} 恢复的用户实例或null
   */
  async restore(id) {
    try {
      const user = await User.findByPk(id, { paranoid: false });
      if (!user) {
        return null;
      }

      await user.restore();
      return user;
    } catch (error) {
      throw new Error(`恢复用户失败: ${error.message}`);
    }
  }

  /**
   * 检查用户名是否存在
   * @param {string} username - 用户名
   * @param {number} excludeId - 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 用户名是否存在
   */
  async isUsernameExists(username, excludeId = null) {
    try {
      const where = { username };
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const user = await User.findOne({ where });
      return !!user;
    } catch (error) {
      throw new Error(`检查用户名是否存在失败: ${error.message}`);
    }
  }

  /**
   * 检查邮箱是否存在
   * @param {string} email - 邮箱地址
   * @param {number} excludeId - 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 邮箱是否存在
   */
  async isEmailExists(email, excludeId = null) {
    try {
      const where = { email: email.toLowerCase() };
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const user = await User.findOne({ where });
      return !!user;
    } catch (error) {
      throw new Error(`检查邮箱是否存在失败: ${error.message}`);
    }
  }

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>} 用户统计信息
   */
  async getStatistics() {
    try {
      const total = await User.count();
      const active = await User.count({ where: { status: 'active' } });
      const verified = await User.count({ where: { email_verified: true } });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRegistered = await User.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      });

      return {
        total,
        active,
        verified,
        todayRegistered,
        verificationRate: total > 0 ? (verified / total * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`获取用户统计信息失败: ${error.message}`);
    }
  }
}

export default new UserRepository();