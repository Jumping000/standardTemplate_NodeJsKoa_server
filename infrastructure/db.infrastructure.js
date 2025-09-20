import { sequelize } from "../config/db.config.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";
// 导入模型以确保它们被注册到Sequelize
import "../models/user/user.model.js";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 确保数据库目录存在
 */
const ensureDatabaseDirectory = () => {
  const databaseDir = join(__dirname, "..", "database");
  if (!existsSync(databaseDir)) {
    mkdirSync(databaseDir, { recursive: true });
    console.log("📁 数据库目录已创建:", databaseDir);
  }
};

/**
 * 测试数据库连接
 * @returns {Promise<boolean>} 连接是否成功
 */
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ SQLite数据库连接成功");
    return true;
  } catch (error) {
    console.error("❌ SQLite数据库连接失败:", error.message);
    return false;
  }
};

/**
 * 同步数据库模型
 * @param {Object} options - 同步选项
 * @param {boolean} options.force - 是否强制重建表 （默认：false）
 * @param {boolean} options.alter - 是否修改表结构 （默认：false）
 * @returns {Promise<boolean>} 同步是否成功
 */
const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;

    console.log("🔄 开始同步数据库模型...");

    await sequelize.sync({ force, alter });

    if (force) {
      console.log("🔥 数据库表已强制重建");
    } else if (alter) {
      console.log("🔧 数据库表结构已更新");
    } else {
      console.log("✅ 数据库模型同步完成");
    }

    return true;
  } catch (error) {
    console.error("❌ 数据库模型同步失败:", error.message);
    return false;
  }
};

/**
 * 初始化数据库
 * 包括创建目录、测试连接、同步模型
 * @param {Object} options - 初始化选项
 * @returns {Promise<boolean>} 初始化是否成功
 */
const initializeDatabase = async (options = {}) => {
  try {
    console.log("🚀 开始初始化SQLite数据库...");

    // 1. 确保数据库目录存在
    ensureDatabaseDirectory();

    // 2. 测试数据库连接
    const connectionSuccess = await testDatabaseConnection();
    if (!connectionSuccess) {
      throw new Error("数据库连接失败");
    }

    // 3. 同步数据库模型
    const syncSuccess = await syncDatabase(options);
    if (!syncSuccess) {
      throw new Error("数据库模型同步失败");
    }

    console.log("🎉 SQLite数据库初始化完成");
    return true;
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error.message);
    return false;
  }
};

/**
 * 关闭数据库连接
 * @returns {Promise<void>}
 */
const closeDatabaseConnection = async () => {
  try {
    await sequelize.close();
    console.log("🔌 数据库连接已关闭");
  } catch (error) {
    console.error("❌ 关闭数据库连接失败:", error.message);
  }
};

/**
 * 获取数据库连接状态
 * @returns {Object} 连接状态信息
 */
const getDatabaseStatus = () => {
  return {
    dialect: sequelize.getDialect(),
    connectionState: sequelize.connectionManager.pool
      ? "connected"
      : "disconnected",
    modelCount: Object.keys(sequelize.models).length,
  };
};

export {
  sequelize,
  initializeDatabase,
  testDatabaseConnection,
  syncDatabase,
  closeDatabaseConnection,
  getDatabaseStatus,
  ensureDatabaseDirectory,
};
