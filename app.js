import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import cors from "koa-cors";
import serve from "koa-static";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建Koa应用实例
const app = new Koa();
const router = new Router();

// 配置中间件
app.use(cors()); // 启用CORS
app.use(bodyParser()); // 解析请求体
app.use(serve(join(__dirname, "public"))); // 静态文件服务

// 基本路由
router.get("/", async (ctx) => {
  ctx.body = {
    message: "Welcome to Koa.js Server!",
    timestamp: new Date().toISOString(),
    status: "success",
  };
});

router.get("/api/health", async (ctx) => {
  ctx.body = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// API示例路由
router.get("/api/users", async (ctx) => {
  ctx.body = {
    users: [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
    ],
  };
});

router.post("/api/users", async (ctx) => {
  const { name, email } = ctx.request.body;

  if (!name || !email) {
    ctx.status = 400;
    ctx.body = {
      error: "Name and email are required",
      status: "error",
    };
    return;
  }

  ctx.status = 201;
  ctx.body = {
    message: "User created successfully",
    user: { id: Date.now(), name, email },
    status: "success",
  };
});

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      status: "error",
    };
    console.error("Error:", err);
  }
});

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints:`);
  console.log(`   GET  /              - Welcome message`);
  console.log(`   GET  /api/health    - Health check`);
  console.log(`   GET  /api/users     - Get users list`);
  console.log(`   POST /api/users     - Create new user`);
});

export default app;
