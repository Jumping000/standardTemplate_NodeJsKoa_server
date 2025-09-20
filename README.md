# Koa.js Server

基于Koa.js框架构建的现代Node.js服务器应用。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 启动生产服务器
```bash
npm start
```

## 📁 项目结构

```
server/
├── app.js              # 主应用文件
├── package.json        # 项目配置和依赖
├── .gitignore         # Git忽略文件
├── README.md          # 项目说明
├── public/            # 静态文件目录
│   └── index.html     # 欢迎页面
├── routes/            # 路由文件目录
├── middleware/        # 中间件目录
└── controllers/       # 控制器目录
```

## 📚 API端点

### 基础端点
- `GET /` - 欢迎消息
- `GET /api/health` - 健康检查

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建新用户

## 🛠️ 技术栈

- **框架**: Koa.js
- **路由**: @koa/router
- **中间件**: 
  - koa-bodyparser (请求体解析)
  - koa-cors (跨域支持)
  - koa-static (静态文件服务)
- **开发工具**: nodemon (自动重启)

## 🔧 配置

1. 复制 `.env.example` 为 `.env`
2. 根据需要修改环境变量
3. 重启服务器

## 📝 开发说明

- 使用ES6模块语法
- 支持async/await
- 内置错误处理
- CORS支持
- 静态文件服务

## 🤝 贡献

欢迎提交Issue和Pull Request！