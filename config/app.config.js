/**
 * 应用配置文件
 * 统一管理应用的各种配置参数
 */

// 服务器配置
export const serverConfig = {
  port: 3610,
  host: "localhost",
  env: "development",
};

// 请求体解析配置
export const bodyParserConfig = {
  enableTypes: ["json", "form"],
  jsonLimit: "100mb", // JSON数据大小限制
  formLimit: "100mb", // 表单数据大小限制
  textLimit: "100mb", // 文本数据大小限制
};

// CORS跨域配置
export const corsConfig = {
  origin: "*", // 允许所有域名访问，生产环境建议设置具体域名
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept"],
};

// 静态文件服务配置
export const staticConfig = {
  root: "./public", // 静态文件根目录
  opts: {
    maxAge: 1000 * 60 * 60 * 24 * 1, // 缓存时间：7天
    index: false, // 默认首页文件 参数可以是字符串（index.html） 也可以是false
  },
};
