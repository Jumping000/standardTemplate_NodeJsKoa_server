/**
 * 中间件配置模块
 * 统一管理和配置所有应用中间件
 */

import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import serve from "koa-static";
import logger from "./logger.middleware.js";
import errorHandler, { setupErrorListener } from "./error.middleware.js";
import {
  bodyParserConfig,
  corsConfig,
  staticConfig,
} from "../config/app.config.js";

/**
 * 配置应用中间件
 * @param {Object} app - Koa应用实例
 */
const setupMiddleware = (app) => {
  // 错误处理中间件 - 必须在所有其他中间件之前注册
  app.use(errorHandler);

  // 设置应用级错误监听器
  setupErrorListener(app);

  // 日志中间件
  app.use(logger);

  // CORS跨域中间件
  app.use(cors(corsConfig));

  // 静态文件服务中间件
  app.use(serve(staticConfig.root, staticConfig.opts));

  // 请求体解析中间件
  app.use(bodyParser(bodyParserConfig));
};

export default setupMiddleware;
