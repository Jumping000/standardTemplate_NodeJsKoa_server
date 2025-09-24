import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

describe('User Routes Integration Tests', () => {
    let app;
    let server;
    let mockUserController;

    beforeAll(async () => {
        // 创建模拟控制器
        mockUserController = {
            authenticateUser: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, message: '登录成功' };
            }),
            createUser: vi.fn(async (ctx) => {
                ctx.status = 201;
                ctx.body = { success: true, message: '用户创建成功' };
            }),
            getUserList: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, data: [] };
            }),
            searchUsers: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, data: [] };
            }),
            getUserStatistics: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, data: {} };
            }),
            getUserByUsername: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, data: {} };
            }),
            getUserById: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, data: {} };
            }),
            updateUser: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, message: '用户更新成功' };
            }),
            deleteUser: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, message: '用户删除成功' };
            }),
            verifyEmail: vi.fn(async (ctx) => {
                ctx.status = 200;
                ctx.body = { success: true, message: '邮箱验证成功' };
            })
        };

        // 模拟控制器模块
        vi.doMock('../../controllers/user/user.controller.js', () => ({
            default: mockUserController
        }));

        // 动态导入路由
        const { default: userRoutes } = await import('../../routes/user.routes.js');

        // 创建测试应用
        app = new Koa();

        // 添加错误处理中间件（必须在最前面）
        app.use(async (ctx, next) => {
            try {
                await next();
            } catch (err) {
                ctx.status = err.status || 500;
                ctx.body = {
                    success: false,
                    message: err.message || 'Internal Server Error'
                };
            }
        });

        app.use(bodyParser());

        app.use(userRoutes.routes());
        app.use(userRoutes.allowedMethods());

        // 启动测试服务器
        server = app.listen();
    });

    afterAll(() => {
        if (server) {
            server.close();
        }
        vi.doUnmock('../controllers/user/user.controller.js');
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/users/auth/login', () => {
        it('应该调用用户登录控制器', async () => {
            const loginData = {
                username: 'testuser',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users/auth/login')
                .send(loginData)
                .expect(200);

            expect(mockUserController.authenticateUser).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                message: '登录成功'
            });
        });

        it('应该正确传递请求体数据', async () => {
            const loginData = {
                username: 'testuser',
                password: 'password123'
            };

            await request(server)
                .post('/api/users/auth/login')
                .send(loginData)
                .expect(200);

            expect(mockUserController.authenticateUser).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.authenticateUser.mock.calls[0][0];
            expect(ctx.request.body).toEqual(loginData);
        });
    });

    describe('POST /api/users', () => {
        it('应该调用创建用户控制器', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(mockUserController.createUser).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                message: '用户创建成功'
            });
        });

        it('应该正确传递用户数据', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            };

            await request(server)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(mockUserController.createUser).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.createUser.mock.calls[0][0];
            expect(ctx.request.body).toEqual(userData);
        });
    });

    describe('GET /api/users', () => {
        it('应该调用获取用户列表控制器', async () => {
            const response = await request(server)
                .get('/api/users')
                .expect(200);

            expect(mockUserController.getUserList).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                data: []
            });
        });

        it('应该正确传递查询参数', async () => {
            await request(server)
                .get('/api/users?page=1&limit=10')
                .expect(200);

            expect(mockUserController.getUserList).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.getUserList.mock.calls[0][0];
            expect(ctx.query).toEqual({
                page: '1',
                limit: '10'
            });
        });
    });

    describe('GET /api/users/search', () => {
        it('应该调用搜索用户控制器', async () => {
            const response = await request(server)
                .get('/api/users/search')
                .expect(200);

            expect(mockUserController.searchUsers).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                data: []
            });
        });

        it('应该正确传递搜索参数', async () => {
            await request(server)
                .get('/api/users/search?keyword=test')
                .expect(200);

            expect(mockUserController.searchUsers).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.searchUsers.mock.calls[0][0];
            expect(ctx.query).toEqual({
                keyword: 'test'
            });
        });
    });

    describe('GET /api/users/statistics', () => {
        it('应该调用获取用户统计信息控制器', async () => {
            const response = await request(server)
                .get('/api/users/statistics')
                .expect(200);

            expect(mockUserController.getUserStatistics).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                data: {}
            });
        });
    });

    describe('GET /api/users/username/:username', () => {
        it('应该调用根据用户名获取用户控制器', async () => {
            const response = await request(server)
                .get('/api/users/username/testuser')
                .expect(200);

            expect(mockUserController.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                data: {}
            });
        });

        it('应该正确传递用户名参数', async () => {
            await request(server)
                .get('/api/users/username/testuser')
                .expect(200);

            expect(mockUserController.getUserByUsername).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.getUserByUsername.mock.calls[0][0];
            expect(ctx.params.username).toBe('testuser');
        });
    });

    describe('GET /api/users/:id', () => {
        it('应该调用根据ID获取用户控制器', async () => {
            const response = await request(server)
                .get('/api/users/123')
                .expect(200);

            expect(mockUserController.getUserById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                data: {}
            });
        });

        it('应该正确传递用户ID参数', async () => {
            await request(server)
                .get('/api/users/123')
                .expect(200);

            expect(mockUserController.getUserById).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.getUserById.mock.calls[0][0];
            expect(ctx.params.id).toBe('123');
        });
    });

    describe('PUT /api/users/:id', () => {
        it('应该调用更新用户控制器', async () => {
            const updateData = {
                email: 'updated@example.com'
            };

            const response = await request(server)
                .put('/api/users/123')
                .send(updateData)
                .expect(200);

            expect(mockUserController.updateUser).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                message: '用户更新成功'
            });
        });

        it('应该正确传递更新数据和ID', async () => {
            const updateData = {
                email: 'updated@example.com'
            };

            await request(server)
                .put('/api/users/123')
                .send(updateData)
                .expect(200);

            expect(mockUserController.updateUser).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.updateUser.mock.calls[0][0];
            expect(ctx.params.id).toBe('123');
            expect(ctx.request.body).toEqual(updateData);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('应该调用删除用户控制器', async () => {
            const response = await request(server)
                .delete('/api/users/123')
                .expect(200);

            expect(mockUserController.deleteUser).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                message: '用户删除成功'
            });
        });

        it('应该正确传递用户ID参数', async () => {
            await request(server)
                .delete('/api/users/123')
                .expect(200);

            expect(mockUserController.deleteUser).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.deleteUser.mock.calls[0][0];
            expect(ctx.params.id).toBe('123');
        });
    });

    describe('POST /api/users/:id/verify-email', () => {
        it('应该调用验证邮箱控制器', async () => {
            const response = await request(server)
                .post('/api/users/123/verify-email')
                .expect(200);

            expect(mockUserController.verifyEmail).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
                success: true,
                message: '邮箱验证成功'
            });
        });

        it('应该正确传递用户ID参数', async () => {
            await request(server)
                .post('/api/users/123/verify-email')
                .expect(200);

            expect(mockUserController.verifyEmail).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.verifyEmail.mock.calls[0][0];
            expect(ctx.params.id).toBe('123');
        });
    });

    describe('路由优先级测试', () => {
        it('应该优先匹配具体路径而不是参数路径', async () => {
            // /api/users/statistics 应该匹配 statistics 路由，而不是 /:id 路由
            await request(server)
                .get('/api/users/statistics')
                .expect(200);

            expect(mockUserController.getUserStatistics).toHaveBeenCalledTimes(1);
            expect(mockUserController.getUserById).not.toHaveBeenCalled();
        });

        it('应该优先匹配 /search 而不是 /:id', async () => {
            await request(server)
                .get('/api/users/search')
                .expect(200);

            expect(mockUserController.searchUsers).toHaveBeenCalledTimes(1);
            expect(mockUserController.getUserById).not.toHaveBeenCalled();
        });
    });

    describe('HTTP方法测试', () => {
        it('应该只接受正确的HTTP方法', async () => {
            // GET /api/users 应该成功
            await request(server)
                .get('/api/users')
                .expect(200);

            // POST /api/users 应该成功
            await request(server)
                .post('/api/users')
                .send({ username: 'test' })
                .expect(201);

            // PUT /api/users 应该失败 (不支持的方法)
            await request(server)
                .put('/api/users')
                .expect(405);
        });
    });

    describe('路由前缀测试', () => {
        it('应该正确应用 /api/users 前缀', async () => {
            // 有前缀的路径应该成功
            await request(server)
                .get('/api/users')
                .expect(200);

            // 没有前缀的路径应该失败
            await request(server)
                .get('/users')
                .expect(404);
        });
    });

    describe('错误处理测试', () => {
        it('应该处理控制器抛出的错误', async () => {
            // 模拟控制器抛出错误
            mockUserController.getUserList.mockImplementationOnce(async (ctx) => {
                throw new Error('数据库连接失败');
            });

            const response = await request(server)
                .get('/api/users')
                .expect(500);

            expect(response.body).toEqual({
                success: false,
                message: '数据库连接失败'
            });
        });

        it('应该处理带状态码的错误', async () => {
            // 模拟控制器抛出带状态码的错误
            mockUserController.getUserById.mockImplementationOnce(async (ctx) => {
                const error = new Error('用户不存在');
                error.status = 404;
                throw error;
            });

            const response = await request(server)
                .get('/api/users/999')
                .expect(404);

            expect(response.body).toEqual({
                success: false,
                message: '用户不存在'
            });
        });

        it('应该处理验证错误', async () => {
            mockUserController.createUser.mockImplementationOnce(async (ctx) => {
                const error = new Error('用户名已存在');
                error.status = 400;
                throw error;
            });

            const response = await request(server)
                .post('/api/users')
                .send({ username: 'existinguser' })
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: '用户名已存在'
            });
        });
    });

    describe('请求体验证测试', () => {
        it('应该正确解析JSON请求体', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            };

            await request(server)
                .post('/api/users')
                .send(userData)
                .set('Content-Type', 'application/json')
                .expect(201);

            expect(mockUserController.createUser).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.createUser.mock.calls[0][0];
            expect(ctx.request.body).toEqual(userData);
        });

        it('应该处理空请求体', async () => {
            await request(server)
                .post('/api/users')
                .expect(201);

            expect(mockUserController.createUser).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.createUser.mock.calls[0][0];
            expect(ctx.request.body).toEqual({});
        });

        it('应该处理无效的JSON', async () => {
            const response = await request(server)
                .post('/api/users')
                .send('{"invalid": json}')
                .set('Content-Type', 'application/json')
                .expect(400);

            // 检查响应体结构 - Koa bodyParser会抛出错误，被错误处理中间件捕获
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('查询参数测试', () => {
        it('应该正确处理多个查询参数', async () => {
            await request(server)
                .get('/api/users?page=1&limit=10&sort=username')
                .expect(200);

            expect(mockUserController.getUserList).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.getUserList.mock.calls[0][0];
            expect(ctx.query).toEqual({
                page: '1',
                limit: '10',
                sort: 'username'
            });
        });

        it('应该正确处理搜索查询参数', async () => {
            await request(server)
                .get('/api/users/search?keyword=john&type=username&active=true')
                .expect(200);

            expect(mockUserController.searchUsers).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.searchUsers.mock.calls[0][0];
            expect(ctx.query).toEqual({
                keyword: 'john',
                type: 'username',
                active: 'true'
            });
        });

        it('应该处理URL编码的查询参数', async () => {
            await request(server)
                .get('/api/users/search?keyword=john%20doe')
                .expect(200);

            expect(mockUserController.searchUsers).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.searchUsers.mock.calls[0][0];
            expect(ctx.query.keyword).toBe('john doe');
        });
    });

    describe('路径参数验证测试', () => {
        it('应该处理数字ID参数', async () => {
            await request(server)
                .get('/api/users/123')
                .expect(200);

            const ctx = mockUserController.getUserById.mock.calls[0][0];
            expect(ctx.params.id).toBe('123');
        });

        it('应该处理字符串用户名参数', async () => {
            await request(server)
                .get('/api/users/username/john_doe')
                .expect(200);

            const ctx = mockUserController.getUserByUsername.mock.calls[0][0];
            expect(ctx.params.username).toBe('john_doe');
        });

        it('应该处理包含特殊字符的用户名', async () => {
            await request(server)
                .get('/api/users/username/user.name')
                .expect(200);

            const ctx = mockUserController.getUserByUsername.mock.calls[0][0];
            expect(ctx.params.username).toBe('user.name');
        });
    });

    describe('HTTP头部测试', () => {
        it('应该正确处理Content-Type头部', async () => {
            await request(server)
                .post('/api/users')
                .send({ username: 'test' })
                .set('Content-Type', 'application/json')
                .expect(201);

            const ctx = mockUserController.createUser.mock.calls[0][0];
            expect(ctx.request.type).toBe('application/json');
        });

        it('应该正确处理自定义头部', async () => {
            await request(server)
                .get('/api/users')
                .set('X-Request-ID', '12345')
                .expect(200);

            const ctx = mockUserController.getUserList.mock.calls[0][0];
            expect(ctx.request.headers['x-request-id']).toBe('12345');
        });
    });

    describe('响应格式测试', () => {
        it('应该返回正确的响应格式', async () => {
            const response = await request(server)
                .get('/api/users')
                .expect(200)
                .expect('Content-Type', /json/);

            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('data');
        });

        it('应该设置正确的状态码', async () => {
            // 创建用户应该返回201
            await request(server)
                .post('/api/users')
                .send({ username: 'test' })
                .expect(201);

            // 获取用户应该返回200
            await request(server)
                .get('/api/users')
                .expect(200);

            // 更新用户应该返回200
            await request(server)
                .put('/api/users/123')
                .send({ email: 'test@example.com' })
                .expect(200);

            // 删除用户应该返回200
            await request(server)
                .delete('/api/users/123')
                .expect(200);
        });
    });

    describe('中间件集成测试', () => {
        it('应该正确应用bodyParser中间件', async () => {
            const userData = { username: 'test', email: 'test@example.com' };

            await request(server)
                .post('/api/users')
                .send(userData)
                .expect(201);

            const ctx = mockUserController.createUser.mock.calls[0][0];
            expect(ctx.request.body).toEqual(userData);
        });

        it('应该正确应用错误处理中间件', async () => {
            mockUserController.getUserList.mockImplementationOnce(async () => {
                throw new Error('测试错误');
            });

            const response = await request(server)
                .get('/api/users')
                .expect(500);

            expect(response.body).toEqual({
                success: false,
                message: '测试错误'
            });
        });
    });

    describe('路由匹配优先级详细测试', () => {
        it('应该优先匹配 /auth/login 而不是 /:id', async () => {
            await request(server)
                .post('/api/users/auth/login')
                .send({ username: 'test', password: 'test' })
                .expect(200);

            expect(mockUserController.authenticateUser).toHaveBeenCalledTimes(1);
            expect(mockUserController.getUserById).not.toHaveBeenCalled();
        });

        it('应该优先匹配 /username/:username 而不是 /:id', async () => {
            await request(server)
                .get('/api/users/username/testuser')
                .expect(200);

            expect(mockUserController.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(mockUserController.getUserById).not.toHaveBeenCalled();
        });

        it('应该正确匹配 /:id/verify-email', async () => {
            await request(server)
                .post('/api/users/123/verify-email')
                .expect(200);

            expect(mockUserController.verifyEmail).toHaveBeenCalledTimes(1);
            const ctx = mockUserController.verifyEmail.mock.calls[0][0];
            expect(ctx.params.id).toBe('123');
        });
    });

    describe('边界情况测试', () => {
        it('应该处理非常长的URL参数', async () => {
            const longId = 'a'.repeat(1000);
            await request(server)
                .get(`/api/users/${longId}`)
                .expect(200);

            const ctx = mockUserController.getUserById.mock.calls[0][0];
            expect(ctx.params.id).toBe(longId);
        });

        it('应该处理包含特殊字符的参数', async () => {
            const specialUsername = 'user@domain.com';
            await request(server)
                .get(`/api/users/username/${encodeURIComponent(specialUsername)}`)
                .expect(200);

            const ctx = mockUserController.getUserByUsername.mock.calls[0][0];
            expect(ctx.params.username).toBe(specialUsername);
        });

        it('应该处理大型请求体', async () => {
            const largeData = {
                username: 'test',
                description: 'x'.repeat(10000)
            };

            await request(server)
                .post('/api/users')
                .send(largeData)
                .expect(201);

            const ctx = mockUserController.createUser.mock.calls[0][0];
            expect(ctx.request.body).toEqual(largeData);
        });
    });

    describe('并发请求测试', () => {
        it('应该正确处理并发请求', async () => {
            const requests = Array.from({ length: 10 }, (_, i) =>
                request(server)
                    .get(`/api/users/${i}`)
                    .expect(200)
            );

            await Promise.all(requests);

            expect(mockUserController.getUserById).toHaveBeenCalledTimes(10);
        });
    });
});