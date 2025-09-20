import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SQLite数据库配置
 * 使用Sequelize ORM连接SQLite数据库
 */
const dbConfig = {
  // 数据库类型
  dialect: "sqlite",

  // SQLite数据库文件路径
  storage: join(__dirname, "..", "database", "app.db"),

  // 连接池配置 - 针对SQLite优化
  pool: {
    max: 1, // SQLite建议使用单连接，避免并发冲突
    min: 0, // 最小连接数保持0，按需创建
    acquire: 60000, // 增加获取连接超时时间
    idle: 300000, // 增加空闲时间，减少频繁的连接创建/销毁
  },

  // 日志配置 （是否需要输出执行的sql）
  logging: false,

  // 定义配置
  define: {
    // 自动添加时间戳字段
    timestamps: true,
    // 字段名使用下划线命名
    underscored: true,
    // 表名不使用复数形式
    freezeTableName: true,
    // 软删除
    paranoid: true,
  },
};

/**
 * 创建Sequelize实例
 */
const sequelize = new Sequelize(dbConfig);

export { sequelize, dbConfig };
