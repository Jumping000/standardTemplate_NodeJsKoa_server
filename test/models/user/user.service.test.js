import { describe, it, expect, beforeEach, vi } from 'vitest';
import userService from '../../../models/user/user.service.js';
import userRepository from '../../../models/user/user.repository.js';
import * as userValidation from '../../../models/user/user.validation.js';
import bcrypt from 'bcrypt';

// Mock dependencies
vi.mock('../../../models/user/user.repository.js');
vi.mock('../../../models/user/user.validation.js');
vi.mock('bcrypt');

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        const mockUserData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            full_name: 'Test User'
        };

        it('应该成功创建用户', async () => {
            // Mock validation
            userValidation.validateUserCreation.mockReturnValue({
                isValid: true,
                errors: []
            });

            // Mock repository methods
            userRepository.isUsernameExists.mockResolvedValue(false);
            userRepository.isEmailExists.mockResolvedValue(false);
            userRepository.create.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                getPublicInfo: () => ({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                })
            });

            // Mock bcrypt
            bcrypt.hash.mockResolvedValue('hashedpassword');

            const result = await userService.createUser(mockUserData);

            expect(result.success).toBe(true);
            expect(result.message).toBe('用户创建成功');
            expect(result.data).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            });
            expect(userRepository.create).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                full_name: 'Test User'
            });
        });

        it('应该在数据验证失败时返回错误', async () => {
            userValidation.validateUserCreation.mockReturnValue({
                isValid: false,
                errors: ['用户名不能为空']
            });

            const result = await userService.createUser(mockUserData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('数据验证失败');
            expect(result.errors).toEqual(['用户名不能为空']);
        });

        it('应该在用户名已存在时返回错误', async () => {
            userValidation.validateUserCreation.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.isUsernameExists.mockResolvedValue(true);

            const result = await userService.createUser(mockUserData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户名已存在');
            expect(result.errors).toEqual(['用户名已被使用']);
        });

        it('应该在邮箱已存在时返回错误', async () => {
            userValidation.validateUserCreation.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.isUsernameExists.mockResolvedValue(false);
            userRepository.isEmailExists.mockResolvedValue(true);

            const result = await userService.createUser(mockUserData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('邮箱已存在');
            expect(result.errors).toEqual(['邮箱地址已被使用']);
        });

        it('应该在创建过程中出现异常时返回错误', async () => {
            userValidation.validateUserCreation.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.isUsernameExists.mockResolvedValue(false);
            userRepository.isEmailExists.mockResolvedValue(false);
            userRepository.create.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.createUser(mockUserData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('创建用户失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('getUserById', () => {
        it('应该成功获取用户信息（公开信息）', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                getPublicInfo: () => ({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                })
            };

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById(1);

            expect(result.success).toBe(true);
            expect(result.message).toBe('获取用户信息成功');
            expect(result.data).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            });
        });

        it('应该成功获取用户信息（包含私有信息）', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                getPublicInfo: () => ({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                })
            };

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById(1, true);

            expect(result.success).toBe(true);
            expect(result.message).toBe('获取用户信息成功');
            expect(result.data).toBe(mockUser);
        });

        it('应该在用户不存在时返回错误', async () => {
            userRepository.findById.mockResolvedValue(null);

            const result = await userService.getUserById(999);

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户不存在');
            expect(result.data).toBe(null);
        });

        it('应该在查询过程中出现异常时返回错误', async () => {
            userRepository.findById.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.getUserById(1);

            expect(result.success).toBe(false);
            expect(result.message).toBe('获取用户信息失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('getUserByUsername', () => {
        it('应该成功根据用户名获取用户信息', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                getPublicInfo: () => ({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com'
                })
            };

            userRepository.findByUsername.mockResolvedValue(mockUser);

            const result = await userService.getUserByUsername('testuser');

            expect(result.success).toBe(true);
            expect(result.message).toBe('获取用户信息成功');
            expect(result.data).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            });
        });

        it('应该在用户不存在时返回错误', async () => {
            userRepository.findByUsername.mockResolvedValue(null);

            const result = await userService.getUserByUsername('nonexistent');

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户不存在');
            expect(result.data).toBe(null);
        });

        it('应该在查询过程中出现异常时返回错误', async () => {
            userRepository.findByUsername.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.getUserByUsername('testuser');

            expect(result.success).toBe(false);
            expect(result.message).toBe('获取用户信息失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('getUserList', () => {
        it('应该成功获取用户列表', async () => {
            const mockUsers = [
                {
                    id: 1,
                    username: 'user1',
                    getPublicInfo: () => ({ id: 1, username: 'user1' })
                },
                {
                    id: 2,
                    username: 'user2',
                    getPublicInfo: () => ({ id: 2, username: 'user2' })
                }
            ];

            const mockResult = {
                users: mockUsers,
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            };

            userValidation.validatePaginationParams.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findAll.mockResolvedValue(mockResult);

            const result = await userService.getUserList({ page: 1, limit: 10 });

            expect(result.success).toBe(true);
            expect(result.message).toBe('获取用户列表成功');
            expect(result.data.users).toEqual([
                { id: 1, username: 'user1' },
                { id: 2, username: 'user2' }
            ]);
            expect(result.data.pagination).toEqual(mockResult.pagination);
        });

        it('应该在分页参数验证失败时返回错误', async () => {
            userValidation.validatePaginationParams.mockReturnValue({
                isValid: false,
                errors: ['页码必须大于0']
            });

            const result = await userService.getUserList({ page: -1 });

            expect(result.success).toBe(false);
            expect(result.message).toBe('分页参数验证失败');
            expect(result.errors).toEqual(['页码必须大于0']);
        });

        it('应该在查询过程中出现异常时返回错误', async () => {
            userValidation.validatePaginationParams.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findAll.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.getUserList();

            expect(result.success).toBe(false);
            expect(result.message).toBe('获取用户列表失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('updateUser', () => {
        const mockUpdateData = {
            full_name: 'Updated Name',
            email: 'updated@example.com'
        };

        it('应该成功更新用户信息', async () => {
            const mockExistingUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            };

            const mockUpdatedUser = {
                id: 1,
                username: 'testuser',
                email: 'updated@example.com',
                full_name: 'Updated Name',
                getPublicInfo: () => ({
                    id: 1,
                    username: 'testuser',
                    email: 'updated@example.com',
                    full_name: 'Updated Name'
                })
            };

            userValidation.validateUserUpdate.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findById.mockResolvedValue(mockExistingUser);
            userRepository.isEmailExists.mockResolvedValue(false);
            userRepository.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUser(1, mockUpdateData);

            expect(result.success).toBe(true);
            expect(result.message).toBe('用户信息更新成功');
            expect(result.data).toEqual({
                id: 1,
                username: 'testuser',
                email: 'updated@example.com',
                full_name: 'Updated Name'
            });
        });

        it('应该在数据验证失败时返回错误', async () => {
            userValidation.validateUserUpdate.mockReturnValue({
                isValid: false,
                errors: ['邮箱格式不正确']
            });

            const result = await userService.updateUser(1, mockUpdateData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('数据验证失败');
            expect(result.errors).toEqual(['邮箱格式不正确']);
        });

        it('应该在用户不存在时返回错误', async () => {
            userValidation.validateUserUpdate.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findById.mockResolvedValue(null);

            const result = await userService.updateUser(999, mockUpdateData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户不存在');
            expect(result.errors).toEqual(['指定的用户不存在']);
        });

        it('应该在更新用户名时检查唯一性', async () => {
            const updateDataWithUsername = { username: 'newusername' };
            const mockExistingUser = {
                id: 1,
                username: 'oldusername',
                email: 'test@example.com'
            };

            userValidation.validateUserUpdate.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findById.mockResolvedValue(mockExistingUser);
            userRepository.isUsernameExists.mockResolvedValue(true);

            const result = await userService.updateUser(1, updateDataWithUsername);

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户名已存在');
            expect(result.errors).toEqual(['用户名已被其他用户使用']);
        });

        it('应该在更新邮箱时检查唯一性', async () => {
            const mockExistingUser = {
                id: 1,
                username: 'testuser',
                email: 'old@example.com'
            };

            userValidation.validateUserUpdate.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findById.mockResolvedValue(mockExistingUser);
            userRepository.isEmailExists.mockResolvedValue(true);

            const result = await userService.updateUser(1, { email: 'new@example.com' });

            expect(result.success).toBe(false);
            expect(result.message).toBe('邮箱已存在');
            expect(result.errors).toEqual(['邮箱地址已被其他用户使用']);
        });

        it('应该在更新密码时进行加密', async () => {
            const updateDataWithPassword = { password: 'newpassword123' };
            const mockExistingUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            };

            const mockUpdatedUser = {
                id: 1,
                username: 'testuser',
                getPublicInfo: () => ({ id: 1, username: 'testuser' })
            };

            userValidation.validateUserUpdate.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findById.mockResolvedValue(mockExistingUser);
            userRepository.update.mockResolvedValue(mockUpdatedUser);
            bcrypt.hash.mockResolvedValue('newhashedpassword');

            const result = await userService.updateUser(1, updateDataWithPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);
            expect(userRepository.update).toHaveBeenCalledWith(1, {
                password_hash: 'newhashedpassword'
            });
            expect(result.success).toBe(true);
        });

        it('应该在更新过程中出现异常时返回错误', async () => {
            const updateDataWithoutEmail = { full_name: 'Updated Name' };

            userValidation.validateUserUpdate.mockReturnValue({
                isValid: true,
                errors: []
            });
            userRepository.findById.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            });
            userRepository.update.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.updateUser(1, updateDataWithoutEmail);

            expect(result.success).toBe(false);
            expect(result.message).toBe('更新用户信息失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('deleteUser', () => {
        it('应该成功删除用户', async () => {
            userRepository.softDelete.mockResolvedValue(true);

            const result = await userService.deleteUser(1);

            expect(result.success).toBe(true);
            expect(result.message).toBe('用户删除成功');
            expect(userRepository.softDelete).toHaveBeenCalledWith(1);
        });

        it('应该在用户不存在时返回错误', async () => {
            userRepository.softDelete.mockResolvedValue(false);

            const result = await userService.deleteUser(999);

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户不存在');
            expect(result.errors).toEqual(['指定的用户不存在']);
        });

        it('应该在删除过程中出现异常时返回错误', async () => {
            userRepository.softDelete.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.deleteUser(1);

            expect(result.success).toBe(false);
            expect(result.message).toBe('删除用户失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('authenticateUser', () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password_hash: 'hashedpassword',
            status: 'active',
            updateLastLogin: vi.fn(),
            getPublicInfo: () => ({
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            })
        };

        it('应该成功验证用户登录', async () => {
            userRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const result = await userService.authenticateUser('testuser', 'password123', '127.0.0.1');

            expect(result.success).toBe(true);
            expect(result.message).toBe('登录成功');
            expect(result.data).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            });
            expect(mockUser.updateLastLogin).toHaveBeenCalledWith('127.0.0.1');
        });

        it('应该在用户不存在时返回错误', async () => {
            userRepository.findByUsernameOrEmail.mockResolvedValue(null);

            const result = await userService.authenticateUser('nonexistent', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户名或密码错误');
            expect(result.errors).toEqual(['登录凭据无效']);
        });

        it('应该在用户状态非活跃时返回错误', async () => {
            const inactiveUser = { ...mockUser, status: 'inactive' };
            userRepository.findByUsernameOrEmail.mockResolvedValue(inactiveUser);

            const result = await userService.authenticateUser('testuser', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('账户已被禁用');
            expect(result.errors).toEqual(['账户状态异常，请联系管理员']);
        });

        it('应该在密码错误时返回错误', async () => {
            userRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const result = await userService.authenticateUser('testuser', 'wrongpassword');

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户名或密码错误');
            expect(result.errors).toEqual(['登录凭据无效']);
        });

        it('应该在验证过程中出现异常时返回错误', async () => {
            userRepository.findByUsernameOrEmail.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.authenticateUser('testuser', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('登录失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('verifyEmail', () => {
        it('应该成功验证邮箱', async () => {
            const mockUser = {
                id: 1,
                email_verified: false
            };

            const mockUpdatedUser = {
                id: 1,
                email_verified: true,
                getPublicInfo: () => ({
                    id: 1,
                    username: 'testuser',
                    email_verified: true
                })
            };

            userRepository.findById.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.verifyEmail(1);

            expect(result.success).toBe(true);
            expect(result.message).toBe('邮箱验证成功');
            expect(result.data).toEqual({
                id: 1,
                username: 'testuser',
                email_verified: true
            });
            expect(userRepository.update).toHaveBeenCalledWith(1, {
                email_verified: true,
                email_verified_at: expect.any(Date)
            });
        });

        it('应该在用户不存在时返回错误', async () => {
            userRepository.findById.mockResolvedValue(null);

            const result = await userService.verifyEmail(999);

            expect(result.success).toBe(false);
            expect(result.message).toBe('用户不存在');
            expect(result.errors).toEqual(['指定的用户不存在']);
        });

        it('应该在邮箱已验证时返回错误', async () => {
            const mockUser = {
                id: 1,
                email_verified: true
            };

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.verifyEmail(1);

            expect(result.success).toBe(false);
            expect(result.message).toBe('邮箱已验证');
            expect(result.errors).toEqual(['邮箱已经验证过了']);
        });

        it('应该在验证过程中出现异常时返回错误', async () => {
            userRepository.findById.mockResolvedValue({
                id: 1,
                email_verified: false
            });
            userRepository.update.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.verifyEmail(1);

            expect(result.success).toBe(false);
            expect(result.message).toBe('邮箱验证失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('getUserStatistics', () => {
        it('应该成功获取用户统计信息', async () => {
            const mockStatistics = {
                total: 100,
                active: 80,
                verified: 60,
                todayRegistered: 5,
                verificationRate: 0.6
            };

            userRepository.getStatistics.mockResolvedValue(mockStatistics);

            const result = await userService.getUserStatistics();

            expect(result.success).toBe(true);
            expect(result.message).toBe('获取统计信息成功');
            expect(result.data).toEqual(mockStatistics);
        });

        it('应该在获取统计信息过程中出现异常时返回错误', async () => {
            userRepository.getStatistics.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.getUserStatistics();

            expect(result.success).toBe(false);
            expect(result.message).toBe('获取统计信息失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });

    describe('searchUsers', () => {
        it('应该成功搜索用户', async () => {
            const mockUsers = [
                {
                    id: 1,
                    username: 'testuser',
                    getPublicInfo: () => ({ id: 1, username: 'testuser' })
                }
            ];

            const mockResult = {
                users: mockUsers,
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            };

            userRepository.findAll.mockResolvedValue(mockResult);

            const result = await userService.searchUsers('test', { page: 1, limit: 10 });

            expect(result.success).toBe(true);
            expect(result.message).toBe('搜索用户成功');
            expect(result.data.users).toEqual([{ id: 1, username: 'testuser' }]);
            expect(result.data.pagination).toEqual(mockResult.pagination);
            expect(result.data.keyword).toBe('test');
        });

        it('应该在搜索过程中出现异常时返回错误', async () => {
            userRepository.findAll.mockRejectedValue(new Error('数据库错误'));

            const result = await userService.searchUsers('test');

            expect(result.success).toBe(false);
            expect(result.message).toBe('搜索用户失败');
            expect(result.errors).toEqual(['数据库错误']);
        });
    });
});