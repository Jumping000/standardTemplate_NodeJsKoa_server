import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.config.js';

/**
 * 用户数据模型
 * 定义用户表的结构和约束
 */
const User = sequelize.define('User', {
  // 主键ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户唯一标识'
  },

  // 用户名
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true,
      isAlphanumeric: true
    },
    comment: '用户名，唯一标识'
  },

  // 邮箱
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    comment: '用户邮箱地址'
  },

  // 密码哈希
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    },
    comment: '密码哈希值'
  },

  // 真实姓名
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    },
    comment: '用户真实姓名'
  },

  // 头像URL
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    },
    comment: '用户头像URL'
  },

  // 手机号
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[+]?[\d\s\-()]+$/
    },
    comment: '用户手机号'
  },

  // 生日
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '用户生日'
  },

  // 性别
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
    comment: '用户性别'
  },

  // 账户状态
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'deleted'),
    defaultValue: 'active',
    allowNull: false,
    comment: '账户状态'
  },

  // 邮箱验证状态
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: '邮箱是否已验证'
  },

  // 邮箱验证时间
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '邮箱验证时间'
  },

  // 最后登录时间
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },

  // 最后登录IP
  last_login_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: true
    },
    comment: '最后登录IP地址'
  },

  // 登录次数
  login_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: '登录次数统计'
  },

  // 用户偏好设置（JSON格式）
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: '用户偏好设置'
  },

  // 用户元数据（JSON格式）
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: '用户元数据'
  }
}, {
  // 表名
  tableName: 'users',
  
  // 索引定义
  indexes: [
    {
      unique: true,
      fields: ['username']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['email_verified']
    },
    {
      fields: ['last_login_at']
    }
  ],

  // 钩子函数
  hooks: {
    beforeCreate: (user) => {
      // 创建前的处理逻辑
      if (user.email) {
        user.email = user.email.toLowerCase();
      }
    },
    beforeUpdate: (user) => {
      // 更新前的处理逻辑
      if (user.email) {
        user.email = user.email.toLowerCase();
      }
    }
  }
});

/**
 * 实例方法：获取用户公开信息
 * @returns {Object} 用户公开信息
 */
User.prototype.getPublicInfo = function() {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    full_name: this.full_name,
    avatar_url: this.avatar_url,
    status: this.status,
    email_verified: this.email_verified,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

/**
 * 实例方法：更新最后登录信息
 * @param {string} ip - 登录IP地址
 * @returns {Promise<User>} 更新后的用户实例
 */
User.prototype.updateLastLogin = async function(ip = null) {
  this.last_login_at = new Date();
  this.login_count = (this.login_count || 0) + 1;
  if (ip) {
    this.last_login_ip = ip;
  }
  return await this.save();
};

export default User;