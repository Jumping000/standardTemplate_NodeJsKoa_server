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
