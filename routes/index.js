/**
 * 路由管理器
 * 统一管理和注册所有应用路由
 */

import Router from "@koa/router";
import basicRoutes from "./basic.routes.js";

const router = new Router();

/**
 * 注册所有路由模块
 */
router.use(basicRoutes.routes());
router.use(basicRoutes.allowedMethods());

// TODO: 在这里添加其他路由模块
// import userRoutes from "./user.routes.js";
// router.use(userRoutes.routes());
// router.use(userRoutes.allowedMethods());

/**
 * 设置应用路由
 * @param {Object} app - Koa应用实例
 */
const setupRoutes = (app) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
};

export default setupRoutes;
