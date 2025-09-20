# Koa.js 服务端基础环境

一个基于 Node.js + Koa.js + SQLite 的现代化服务端应用框架，采用 MVC 架构模式和 ES Modules 模块系统。

## 🚀 技术栈

- **运行环境**: Node.js
- **Web框架**: Koa.js 3.0.1
- **数据库**: SQLite 5.1.7
- **ORM**: Sequelize 6.37.7
- **模块系统**: ES Modules
- **包管理器**: pnpm
- **开发工具**: nodemon

## 📦 核心依赖

### 生产依赖
- `koa` - 轻量级 Web 框架
- `@koa/router` - 路由管理
- `koa-bodyparser` - 请求体解析
- `koa-cors` - 跨域资源共享
- `koa-static` - 静态文件服务
- `sequelize` - ORM 数据库操作
- `sqlite3` - SQLite 数据库驱动
- `bcrypt` - 密码加密

### 开发依赖
- `nodemon` - 开发环境热重载

## 🏗️ 项目架构

```
server/
├── app.js                  # 应用主入口文件
├── config/                 # 配置文件目录
│   ├── app.config.js      # 应用配置（服务器、CORS、请求体解析）
│   └── db.config.js       # 数据库配置
├── controllers/           # 控制器层（业务逻辑处理）
├── middleware/            # 中间件目录
│   ├── index.js          # 中间件配置管理
│   └── error.middleware.js # 错误处理中间件
├── routes/                # 路由定义
│   ├── index.js          # 路由管理器
│   └── basic.routes.js   # 基础路由
├── models/                # 数据模型层
│   └── user/             # 用户相关模型
│       ├── user.model.js      # 用户数据模型
│       ├── user.repository.js # 数据访问层
│       ├── user.service.js    # 业务逻辑层
│       └── user.validation.js # 数据验证层
├── infrastructure/        # 基础设施
│   └── db.infrastructure.js # 数据库初始化和管理
├── database/             # 数据库文件目录（自动创建）
├── public/               # 静态资源
│   └── index.html       # 默认首页
├── package.json          # 项目配置
└── pnpm-lock.yaml       # 依赖锁定文件
```

## 🎯 架构特点

### MVC 架构模式
- **Model（模型层）**: 数据模型、数据访问、业务逻辑
- **View（视图层）**: 静态资源和前端页面
- **Controller（控制器层）**: 请求处理和响应管理

### 目录职责分离
- **严格按目录职责开发**，禁止跨职责混合
- **config/**: 仅配置文件
- **controllers/**: 仅业务逻辑处理
- **middleware/**: 仅中间件
- **routes/**: 仅路由定义
- **models/**: 仅数据模型和相关逻辑
- **infrastructure/**: 仅基础设施初始化

## 🛠️ 安装和运行

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0

### 安装依赖
```bash
# 使用 pnpm 安装依赖
pnpm install
```

### 运行项目
```bash
# 开发模式（热重载）
pnpm run dev

# 生产模式
pnpm start
```

### 访问应用
- 服务器地址: http://localhost:3610
- 健康检查: http://localhost:3610/api/health

## 📊 数据库

### SQLite 配置
- **数据库文件**: `database/app.db`（自动创建）
- **ORM**: Sequelize
- **连接池**: 单连接模式（SQLite 推荐）
- **自动同步**: 支持模型自动同步到数据库

### 用户模型特性
- 完整的用户信息字段（用户名、邮箱、密码、个人信息等）
- 数据验证和约束
- 索引优化
- 软删除支持
- 时间戳自动管理

## 🔧 配置说明

### 服务器配置 (`config/app.config.js`)
```javascript
export const serverConfig = {
  port: 3610,           // 服务器端口
  host: "localhost",    // 服务器主机
  env: "development",   // 运行环境
};
```

### 数据库配置 (`config/db.config.js`)
- SQLite 数据库文件路径配置
- Sequelize 连接池优化
- 模型定义配置（时间戳、软删除等）

## 🚦 API 接口

### 基础接口
- `GET /` - 欢迎页面
- `GET /api/health` - 健康检查

### 响应格式
```json
{
  "status": "success",
  "message": "响应消息",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 安全特性

- **密码加密**: 使用 bcrypt 进行密码哈希
- **CORS 配置**: 跨域请求控制
- **数据验证**: Sequelize 模型层数据验证
- **错误处理**: 统一错误处理中间件

## 📝 开发规范

### 编码规范
- 使用 ES6+ 语法和 ES Modules
- 优先使用 async/await
- 遵循驼峰命名法
- 添加必要的 JSDoc 注释

### 文件组织
- 按功能模块组织代码
- 严格遵循目录职责分离
- 优先编辑现有文件，避免不必要的新文件

## 🔄 数据库管理

### 初始化
应用启动时会自动：
1. 创建数据库目录
2. 测试数据库连接
3. 同步数据库模型
4. 创建必要的表和索引

### 模型同步选项
```javascript
// 在 infrastructure/db.infrastructure.js 中配置
const options = {
  force: false,  // 是否强制重建表
  alter: false,  // 是否修改表结构
};
```

## 🚀 部署建议

### 生产环境配置
1. 修改 `config/app.config.js` 中的环境配置
2. 配置适当的 CORS 域名限制
3. 启用数据库日志记录（如需要）
4. 配置进程管理器（如 PM2）

### 性能优化
- SQLite 单连接模式避免并发冲突
- 合理的连接池配置
- 数据库索引优化
- 静态资源缓存

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

---

**注意**: 这是一个基础的服务端环境框架，可以根据具体业务需求进行扩展和定制。