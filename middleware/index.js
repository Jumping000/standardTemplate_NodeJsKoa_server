/**
 * 中间件配置模块
 * 统一管理和配置所有应用中间件
 */

import bodyParser from "koa-bodyparser";
import { bodyParserConfig } from "../config/app.config.js";

/**
 * 配置应用中间件
 * @param {Object} app - Koa应用实例
 */
const setupMiddleware = (app) => {
  // 请求体解析中间件
  app.use(bodyParser(bodyParserConfig));
};

export default setupMiddleware;
