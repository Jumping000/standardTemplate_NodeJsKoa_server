/**
 * 应用主入口文件
 * 负责应用的初始化、启动和关闭
 * 严格遵循目录职责分离原则
 */

import Koa from "koa";
import {
  initializeDatabase,
  closeDatabaseConnection,
} from "./infrastructure/db.infrastructure.js";
import setupMiddleware from "./middleware/index.js";
import setupRoutes from "./routes/index.js";
import { serverConfig } from "./config/app.conifg.js";

// 创建Koa应用实例
const app = new Koa();

// 配置中间件
setupMiddleware(app);

// 配置路由
setupRoutes(app);

// 服务器配置
const { port: PORT, host: HOST } = serverConfig;

/**
 * 启动应用服务器
 */
const startServer = async () => {
  try {
    // 初始化数据库
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error("❌ 数据库初始化失败，服务器启动中止");
      process.exit(1);
    }

    // 启动HTTP服务器
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ 服务器启动失败:", error.message);
    process.exit(1);
  }
};

/**
 * 优雅关闭处理
 * @param {string} signal - 接收到的系统信号
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n📡 收到 ${signal} 信号，开始优雅关闭...`);

  try {
    await closeDatabaseConnection();
    console.log("👋 服务器已优雅关闭");
    process.exit(0);
  } catch (error) {
    console.error("❌ 关闭过程中发生错误:", error.message);
    process.exit(1);
  }
};

// 监听进程信号
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// 启动服务器
startServer();

export default app;
