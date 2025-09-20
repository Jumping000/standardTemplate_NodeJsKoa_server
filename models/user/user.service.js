import userRepository from "./user.repository.js";
import {
  validateUserCreation,
  validateUserUpdate,
  validatePaginationParams,
} from "./user.validation.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

/**
 * 用户业务逻辑层
 * 处理用户相关的业务逻辑，调用repository进行数据操作
 */
class UserService {
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 创建结果
   */
  async createUser(userData) {
    try {
      // 1. 数据验证
      const validation = validateUserCreation(userData);
      if (!validation.isValid) {
        return {
          success: false,
          message: "数据验证失败",
          errors: validation.errors,
        };
      }

      // 2. 检查用户名是否已存在
      const usernameExists = await userRepository.isUsernameExists(
        userData.username
      );
      if (usernameExists) {
        return {
          success: false,
          message: "用户名已存在",
          errors: ["用户名已被使用"],
        };
      }

      // 3. 检查邮箱是否已存在
      const emailExists = await userRepository.isEmailExists(userData.email);
      if (emailExists) {
        return {
          success: false,
          message: "邮箱已存在",
          errors: ["邮箱地址已被使用"],
        };
      }

      // 4. 密码加密
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // 5. 准备用户数据
      const userDataToCreate = {
        ...userData,
        password_hash: passwordHash,
        email: userData.email.toLowerCase(),
      };

      // 移除明文密码
      delete userDataToCreate.password;

      // 6. 创建用户
      const user = await userRepository.create(userDataToCreate);

      return {
        success: true,
        message: "用户创建成功",
        data: user.getPublicInfo(),
      };
    } catch (error) {
      return {
        success: false,
        message: "创建用户失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 根据ID获取用户信息
   * @param {number} id - 用户ID
   * @param {boolean} includePrivate - 是否包含私有信息
   * @returns {Promise<Object>} 查询结果
   */
  async getUserById(id, includePrivate = false) {
    try {
      const user = await userRepository.findById(id);

      if (!user) {
        return {
          success: false,
          message: "用户不存在",
          data: null,
        };
      }

      return {
        success: true,
        message: "获取用户信息成功",
        data: includePrivate ? user : user.getPublicInfo(),
      };
    } catch (error) {
      return {
        success: false,
        message: "获取用户信息失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 根据用户名获取用户信息
   * @param {string} username - 用户名
   * @returns {Promise<Object>} 查询结果
   */
  async getUserByUsername(username) {
    try {
      const user = await userRepository.findByUsername(username);

      if (!user) {
        return {
          success: false,
          message: "用户不存在",
          data: null,
        };
      }

      return {
        success: true,
        message: "获取用户信息成功",
        data: user.getPublicInfo(),
      };
    } catch (error) {
      return {
        success: false,
        message: "获取用户信息失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 获取用户列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 查询结果
   */
  async getUserList(options = {}) {
    try {
      // 验证分页参数
      const paginationValidation = validatePaginationParams(options);
      if (!paginationValidation.isValid) {
        return {
          success: false,
          message: "分页参数验证失败",
          errors: paginationValidation.errors,
        };
      }

      const result = await userRepository.findAll(options);

      // 转换为公开信息
      const publicUsers = result.users.map((user) => user.getPublicInfo());

      return {
        success: true,
        message: "获取用户列表成功",
        data: {
          users: publicUsers,
          pagination: result.pagination,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "获取用户列表失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUser(id, updateData) {
    try {
      // 1. 数据验证
      const validation = validateUserUpdate(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          message: "数据验证失败",
          errors: validation.errors,
        };
      }

      // 2. 检查用户是否存在
      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: "用户不存在",
          errors: ["指定的用户不存在"],
        };
      }

      // 3. 检查用户名唯一性（如果要更新用户名）
      if (
        updateData.username &&
        updateData.username !== existingUser.username
      ) {
        const usernameExists = await userRepository.isUsernameExists(
          updateData.username,
          id
        );
        if (usernameExists) {
          return {
            success: false,
            message: "用户名已存在",
            errors: ["用户名已被其他用户使用"],
          };
        }
      }

      // 4. 检查邮箱唯一性（如果要更新邮箱）
      if (
        updateData.email &&
        updateData.email.toLowerCase() !== existingUser.email
      ) {
        const emailExists = await userRepository.isEmailExists(
          updateData.email,
          id
        );
        if (emailExists) {
          return {
            success: false,
            message: "邮箱已存在",
            errors: ["邮箱地址已被其他用户使用"],
          };
        }
      }

      // 5. 处理密码更新
      const dataToUpdate = { ...updateData };
      if (updateData.password) {
        const saltRounds = 12;
        dataToUpdate.password_hash = await bcrypt.hash(
          updateData.password,
          saltRounds
        );
        delete dataToUpdate.password;
      }

      // 6. 处理邮箱格式
      if (dataToUpdate.email) {
        dataToUpdate.email = dataToUpdate.email.toLowerCase();
      }

      // 7. 更新用户
      const updatedUser = await userRepository.update(id, dataToUpdate);

      return {
        success: true,
        message: "用户信息更新成功",
        data: updatedUser.getPublicInfo(),
      };
    } catch (error) {
      return {
        success: false,
        message: "更新用户信息失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 删除用户（软删除）
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUser(id) {
    try {
      const success = await userRepository.softDelete(id);

      if (!success) {
        return {
          success: false,
          message: "用户不存在",
          errors: ["指定的用户不存在"],
        };
      }

      return {
        success: true,
        message: "用户删除成功",
      };
    } catch (error) {
      return {
        success: false,
        message: "删除用户失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 用户登录验证
   * @param {string} identifier - 用户名或邮箱
   * @param {string} password - 密码
   * @param {string} loginIp - 登录IP
   * @returns {Promise<Object>} 登录结果
   */
  async authenticateUser(identifier, password, loginIp = null) {
    try {
      // 1. 查找用户
      const user = await userRepository.findByUsernameOrEmail(identifier);
      if (!user) {
        return {
          success: false,
          message: "用户名或密码错误",
          errors: ["登录凭据无效"],
        };
      }

      // 2. 检查用户状态
      if (user.status !== "active") {
        return {
          success: false,
          message: "账户已被禁用",
          errors: ["账户状态异常，请联系管理员"],
        };
      }

      // 3. 验证密码
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "用户名或密码错误",
          errors: ["登录凭据无效"],
        };
      }

      // 4. 更新登录信息
      await user.updateLastLogin(loginIp);

      return {
        success: true,
        message: "登录成功",
        data: user.getPublicInfo(),
      };
    } catch (error) {
      return {
        success: false,
        message: "登录失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 验证邮箱
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyEmail(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        return {
          success: false,
          message: "用户不存在",
          errors: ["指定的用户不存在"],
        };
      }

      if (user.email_verified) {
        return {
          success: false,
          message: "邮箱已验证",
          errors: ["邮箱已经验证过了"],
        };
      }

      const updatedUser = await userRepository.update(id, {
        email_verified: true,
        email_verified_at: new Date(),
      });

      return {
        success: true,
        message: "邮箱验证成功",
        data: updatedUser.getPublicInfo(),
      };
    } catch (error) {
      return {
        success: false,
        message: "邮箱验证失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>} 统计结果
   */
  async getUserStatistics() {
    try {
      const statistics = await userRepository.getStatistics();

      return {
        success: true,
        message: "获取统计信息成功",
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        message: "获取统计信息失败",
        errors: [error.message],
      };
    }
  }

  /**
   * 搜索用户
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchUsers(keyword, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const searchOptions = {
        page,
        limit,
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${keyword}%` } },
            { full_name: { [Op.like]: `%${keyword}%` } },
            { email: { [Op.like]: `%${keyword}%` } },
          ],
        },
      };

      const result = await userRepository.findAll(searchOptions);
      const publicUsers = result.users.map((user) => user.getPublicInfo());

      return {
        success: true,
        message: "搜索用户成功",
        data: {
          users: publicUsers,
          pagination: result.pagination,
          keyword,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "搜索用户失败",
        errors: [error.message],
      };
    }
  }
}

export default new UserService();
