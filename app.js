import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import serve from 'koa-static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 导入中间件
import { loggerMiddleware, requestCounterMiddleware } from './middleware/logger.js';

// 导入路由
import userRoutes from './routes/userRoutes.js';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建Koa应用实例
const app = new Koa();
const router = new Router();

// 全局错误处理中间件（最先注册）
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      status: 'error',
      timestamp: new Date().toISOString()
    };
    console.error('❌ 全局错误处理:', err);
  }
});

// 全局中间件（按执行顺序注册）
app.use(requestCounterMiddleware); // 请求计数
app.use(loggerMiddleware);         // 日志记录
app.use(cors());                   // 启用CORS
app.use(bodyParser());             // 解析请求体
app.use(serve(join(__dirname, 'public'))); // 静态文件服务

// 基本路由
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Welcome to Koa.js Server with Middleware & Controllers!',
    timestamp: new Date().toISOString(),
    requestId: ctx.requestId,
    features: [
      '🔐 认证中间件',
      '📝 日志中间件', 
      '🔍 数据验证中间件',
      '🎯 控制器分离',
      '📊 请求计数'
    ],
    status: 'success'
  };
});

router.get('/api/health', async (ctx) => {
  ctx.body = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: ctx.requestId,
    middleware: 'active'
  };
});

// 中间件演示路由
router.get('/api/demo/middleware-flow', async (ctx) => {
  console.log('🎯 演示路由: 中间件流程');
  
  ctx.body = {
    message: '中间件执行流程演示',
    flow: [
      '1. 全局错误处理中间件',
      '2. 请求计数中间件 ✅',
      '3. 日志中间件 ✅', 
      '4. CORS中间件 ✅',
      '5. 请求体解析中间件 ✅',
      '6. 静态文件中间件 ✅',
      '7. 路由中间件 ✅',
      '8. 控制器函数 ✅ (当前位置)'
    ],
    requestId: ctx.requestId,
    timestamp: new Date().toISOString(),
    status: 'success'
  };
});

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());

// 注册用户相关路由（包含中间件示例）
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

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
