import { describe, it, expect, beforeEach, vi } from 'vitest';
import userController from '../../../controllers/user/user.controller.js';
import userService from '../../../models/user/user.service.js';

// Mock userService
vi.mock('../../../models/user/user.service.js');

describe('UserController', () => {
    let ctx;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Koa context
        ctx = {
            request: {
                body: {},
                ip: '127.0.0.1'
            },
            query: {},
            params: {},
            status: 200,
            body: {}
        };
    });

    describe('createUser', () => {
        it('应该成功创建用户', async () => {
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };

            ctx.request.body = mockUserData;
            userService.createUser.mockResolvedValue(mockResult);

            await userController.createUser(ctx);

            expect(ctx.status).toBe(201);
            expect(ctx.body).toEqual({
                success: true,
                message: '用户创建成功',
                data: mockResult.data
            });
            expect(userService.createUser).toHaveBeenCalledWith(mockUserData);
        });

        it('应该在创建失败时返回400错误', async () => {
            const mockUserData = {
                username: 'testuser',
                email: 'invalid-email'
            };

            const mockResult = {
                success: false,
                message: '数据验证失败',
                errors: ['邮箱格式不正确']
            };

            ctx.request.body = mockUserData;
            userService.createUser.mockResolvedValue(mockResult);

            await userController.createUser(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '数据验证失败',
                errors: ['邮箱格式不正确']
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.request.body = { username: 'testuser' };
            userService.createUser.mockRejectedValue(new Error('数据库连接失败'));

            await userController.createUser(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库连接失败'
            });
        });
    });

    describe('getUserList', () => {
        it('应该成功获取用户列表', async () => {
            const mockResult = {
                success: true,
                data: {
                    users: [
                        { id: 1, username: 'user1' },
                        { id: 2, username: 'user2' }
                    ],
                    pagination: {
                        total: 2,
                        page: 1,
                        limit: 10,
                        totalPages: 1
                    }
                }
            };

            ctx.query = { page: '1', limit: '10' };
            userService.getUserList.mockResolvedValue(mockResult);

            await userController.getUserList(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '获取用户列表成功',
                data: mockResult.data,
                pagination: mockResult.pagination
            });
            expect(userService.getUserList).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                status: undefined,
                search: undefined,
                sortBy: 'created_at',
                sortOrder: 'DESC'
            });
        });

        it('应该使用默认分页参数', async () => {
            const mockResult = {
                success: true,
                data: { users: [], pagination: {} }
            };

            userService.getUserList.mockResolvedValue(mockResult);

            await userController.getUserList(ctx);

            expect(userService.getUserList).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                status: undefined,
                search: undefined,
                sortBy: 'created_at',
                sortOrder: 'DESC'
            });
        });

        it('应该在获取失败时返回400错误', async () => {
            const mockResult = {
                success: false,
                message: '分页参数验证失败',
                errors: ['页码必须大于0']
            };

            userService.getUserList.mockResolvedValue(mockResult);

            await userController.getUserList(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '分页参数验证失败',
                errors: ['页码必须大于0']
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            userService.getUserList.mockRejectedValue(new Error('数据库错误'));

            await userController.getUserList(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('getUserById', () => {
        it('应该成功获取用户信息', async () => {
            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };

            ctx.params = { id: '1' };
            userService.getUserById.mockResolvedValue(mockResult);

            await userController.getUserById(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '获取用户信息成功',
                data: mockResult.data
            });
            expect(userService.getUserById).toHaveBeenCalledWith(1, false);
        });

        it('应该支持包含私有信息的查询', async () => {
            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    password_hash: 'hashedpassword'
                }
            };

            ctx.params = { id: '1' };
            ctx.query = { include_private: 'true' };
            userService.getUserById.mockResolvedValue(mockResult);

            await userController.getUserById(ctx);

            expect(userService.getUserById).toHaveBeenCalledWith(1, true);
        });

        it('应该在用户不存在时返回404错误', async () => {
            const mockResult = {
                success: false,
                message: '用户不存在'
            };

            ctx.params = { id: '999' };
            userService.getUserById.mockResolvedValue(mockResult);

            await userController.getUserById(ctx);

            expect(ctx.status).toBe(404);
            expect(ctx.body).toEqual({
                success: false,
                message: '用户不存在'
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.params = { id: '1' };
            userService.getUserById.mockRejectedValue(new Error('数据库错误'));

            await userController.getUserById(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('getUserByUsername', () => {
        it('应该成功根据用户名获取用户信息', async () => {
            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };

            ctx.params = { username: 'testuser' };
            userService.getUserByUsername.mockResolvedValue(mockResult);

            await userController.getUserByUsername(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '获取用户信息成功',
                data: mockResult.data
            });
            expect(userService.getUserByUsername).toHaveBeenCalledWith('testuser');
        });

        it('应该在用户不存在时返回404错误', async () => {
            const mockResult = {
                success: false,
                message: '用户不存在'
            };

            ctx.params = { username: 'nonexistent' };
            userService.getUserByUsername.mockResolvedValue(mockResult);

            await userController.getUserByUsername(ctx);

            expect(ctx.status).toBe(404);
            expect(ctx.body).toEqual({
                success: false,
                message: '用户不存在'
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.params = { username: 'testuser' };
            userService.getUserByUsername.mockRejectedValue(new Error('数据库错误'));

            await userController.getUserByUsername(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('updateUser', () => {
        it('应该成功更新用户信息', async () => {
            const mockUpdateData = {
                full_name: 'Updated Name',
                email: 'updated@example.com'
            };

            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    full_name: 'Updated Name',
                    email: 'updated@example.com'
                }
            };

            ctx.params = { id: '1' };
            ctx.request.body = mockUpdateData;
            userService.updateUser.mockResolvedValue(mockResult);

            await userController.updateUser(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '用户信息更新成功',
                data: mockResult.data
            });
            expect(userService.updateUser).toHaveBeenCalledWith(1, mockUpdateData);
        });

        it('应该在更新失败时返回400错误', async () => {
            const mockResult = {
                success: false,
                message: '数据验证失败',
                errors: ['邮箱格式不正确']
            };

            ctx.params = { id: '1' };
            ctx.request.body = { email: 'invalid-email' };
            userService.updateUser.mockResolvedValue(mockResult);

            await userController.updateUser(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '数据验证失败',
                errors: ['邮箱格式不正确']
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.params = { id: '1' };
            ctx.request.body = { full_name: 'Updated Name' };
            userService.updateUser.mockRejectedValue(new Error('数据库错误'));

            await userController.updateUser(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('deleteUser', () => {
        it('应该成功删除用户', async () => {
            const mockResult = {
                success: true
            };

            ctx.params = { id: '1' };
            userService.deleteUser.mockResolvedValue(mockResult);

            await userController.deleteUser(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '用户删除成功'
            });
            expect(userService.deleteUser).toHaveBeenCalledWith(1);
        });

        it('应该在删除失败时返回400错误', async () => {
            const mockResult = {
                success: false,
                message: '用户不存在'
            };

            ctx.params = { id: '999' };
            userService.deleteUser.mockResolvedValue(mockResult);

            await userController.deleteUser(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '用户不存在'
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.params = { id: '1' };
            userService.deleteUser.mockRejectedValue(new Error('数据库错误'));

            await userController.deleteUser(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('authenticateUser', () => {
        it('应该成功验证用户登录', async () => {
            const mockLoginData = {
                identifier: 'testuser',
                password: 'password123'
            };

            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };

            ctx.request.body = mockLoginData;
            ctx.request.ip = '192.168.1.1';
            userService.authenticateUser.mockResolvedValue(mockResult);

            await userController.authenticateUser(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '登录成功',
                data: mockResult.data
            });
            expect(userService.authenticateUser).toHaveBeenCalledWith(
                'testuser',
                'password123',
                '192.168.1.1'
            );
        });

        it('应该在认证失败时返回401错误', async () => {
            const mockResult = {
                success: false,
                message: '用户名或密码错误',
                errors: ['登录凭据无效']
            };

            ctx.request.body = {
                identifier: 'testuser',
                password: 'wrongpassword'
            };
            userService.authenticateUser.mockResolvedValue(mockResult);

            await userController.authenticateUser(ctx);

            expect(ctx.status).toBe(401);
            expect(ctx.body).toEqual({
                success: false,
                message: '用户名或密码错误',
                errors: ['登录凭据无效']
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.request.body = {
                identifier: 'testuser',
                password: 'password123'
            };
            userService.authenticateUser.mockRejectedValue(new Error('数据库错误'));

            await userController.authenticateUser(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('verifyEmail', () => {
        it('应该成功验证邮箱', async () => {
            const mockResult = {
                success: true,
                data: {
                    id: 1,
                    username: 'testuser',
                    email_verified: true
                }
            };

            ctx.params = { id: '1' };
            userService.verifyEmail.mockResolvedValue(mockResult);

            await userController.verifyEmail(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '邮箱验证成功',
                data: mockResult.data
            });
            expect(userService.verifyEmail).toHaveBeenCalledWith(1);
        });

        it('应该在验证失败时返回400错误', async () => {
            const mockResult = {
                success: false,
                message: '邮箱已验证'
            };

            ctx.params = { id: '1' };
            userService.verifyEmail.mockResolvedValue(mockResult);

            await userController.verifyEmail(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '邮箱已验证'
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.params = { id: '1' };
            userService.verifyEmail.mockRejectedValue(new Error('数据库错误'));

            await userController.verifyEmail(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('searchUsers', () => {
        it('应该成功搜索用户', async () => {
            const mockResult = {
                success: true,
                data: {
                    users: [
                        { id: 1, username: 'testuser' }
                    ],
                    pagination: {
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1
                    },
                    keyword: 'test'
                }
            };

            ctx.query = { keyword: 'test', page: '1', limit: '10' };
            userService.searchUsers.mockResolvedValue(mockResult);

            await userController.searchUsers(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '搜索用户成功',
                data: mockResult.data,
                pagination: mockResult.pagination
            });
            expect(userService.searchUsers).toHaveBeenCalledWith('test', {
                page: 1,
                limit: 10,
                sortBy: 'username',
                sortOrder: 'ASC'
            });
        });

        it('应该在缺少关键词时返回400错误', async () => {
            ctx.query = {};

            await userController.searchUsers(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '搜索关键词不能为空'
            });
            expect(userService.searchUsers).not.toHaveBeenCalled();
        });

        it('应该在搜索失败时返回400错误', async () => {
            const mockResult = {
                success: false,
                message: '搜索失败'
            };

            ctx.query = { keyword: 'test' };
            userService.searchUsers.mockResolvedValue(mockResult);

            await userController.searchUsers(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '搜索失败'
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            ctx.query = { keyword: 'test' };
            userService.searchUsers.mockRejectedValue(new Error('数据库错误'));

            await userController.searchUsers(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });

    describe('getUserStatistics', () => {
        it('应该成功获取用户统计信息', async () => {
            const mockResult = {
                success: true,
                data: {
                    total: 100,
                    active: 80,
                    verified: 60,
                    todayRegistered: 5,
                    verificationRate: 0.6
                }
            };

            userService.getUserStatistics.mockResolvedValue(mockResult);

            await userController.getUserStatistics(ctx);

            expect(ctx.status).toBe(200);
            expect(ctx.body).toEqual({
                success: true,
                message: '获取用户统计信息成功',
                data: mockResult.data
            });
            expect(userService.getUserStatistics).toHaveBeenCalled();
        });

        it('应该在获取失败时返回400错误', async () => {
            const mockResult = {
                success: false,
                message: '获取统计信息失败'
            };

            userService.getUserStatistics.mockResolvedValue(mockResult);

            await userController.getUserStatistics(ctx);

            expect(ctx.status).toBe(400);
            expect(ctx.body).toEqual({
                success: false,
                message: '获取统计信息失败'
            });
        });

        it('应该在服务异常时返回500错误', async () => {
            userService.getUserStatistics.mockRejectedValue(new Error('数据库错误'));

            await userController.getUserStatistics(ctx);

            expect(ctx.status).toBe(500);
            expect(ctx.body).toEqual({
                success: false,
                message: '服务器内部错误',
                error: '数据库错误'
            });
        });
    });
});