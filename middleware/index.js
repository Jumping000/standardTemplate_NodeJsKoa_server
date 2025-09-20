/**
 * 中间件配置模块
 * 统一管理和配置所有应用中间件
 */

import cors from "koa-cors";
import bodyParser from "koa-bodyparser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import errorHandler from "./error.middleware.js";
import { bodyParserConfig } from "../config/app.config.js";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 配置应用中间件
 * @param {Object} app - Koa应用实例
 */
const setupMiddleware = (app) => {
  // 错误处理中间件（必须在最前面）
  app.use(errorHandler);

  // 请求体解析中间件
  app.use(bodyParser(bodyParserConfig));
};

export default setupMiddleware;
