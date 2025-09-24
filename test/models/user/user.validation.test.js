/**
 * 用户验证层单元测试
 * 测试 user.validation.js 中的所有验证函数
 */

import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
  validateBirthDate,
  validateGender,
  validateStatus,
  validateAvatarUrl,
  validateUserCreation,
  validateUserUpdate,
  validatePaginationParams
} from '../../../models/user/user.validation.js';

describe('用户验证层测试', () => {
  
  describe('validateUsername', () => {
    it('应该验证有效的用户名', () => {
      const result = validateUsername('testuser123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝空用户名', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('用户名不能为空');
    });

    it('应该拒绝null或undefined用户名', () => {
      const resultNull = validateUsername(null);
      const resultUndefined = validateUsername(undefined);
      
      expect(resultNull.isValid).toBe(false);
      expect(resultUndefined.isValid).toBe(false);
    });

    it('应该拒绝过短的用户名', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('用户名长度不能少于3个字符');
    });

    it('应该拒绝过长的用户名', () => {
      const longUsername = 'a'.repeat(51);
      const result = validateUsername(longUsername);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('用户名长度不能超过50个字符');
    });

    it('应该拒绝包含特殊字符的用户名', () => {
      const result = validateUsername('test@user');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('用户名只能包含字母、数字和下划线');
    });

    it('应该拒绝以数字开头的用户名', () => {
      const result = validateUsername('123test');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('用户名不能以数字开头');
    });

    it('应该接受包含下划线的用户名', () => {
      const result = validateUsername('test_user');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝空邮箱地址', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('邮箱地址不能为空');
    });

    it('应该拒绝格式错误的邮箱地址', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test.example.com',
        'test@.com',
        'test@example.'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('邮箱地址格式不正确');
      });
    });

    it('应该接受各种有效的邮箱格式', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('validatePassword', () => {
    it('应该验证有效的密码', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝空密码', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码不能为空');
    });

    it('应该拒绝过短的密码', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码长度不能少于6个字符');
    });

    it('应该拒绝过长的密码', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码长度不能超过128个字符');
    });

    it('应该拒绝不包含大写字母的密码', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个大写字母');
    });

    it('应该拒绝不包含小写字母的密码', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个小写字母');
    });

    it('应该拒绝不包含数字的密码', () => {
      const result = validatePassword('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个数字');
    });

    it('应该拒绝不包含特殊字符的密码', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个特殊字符(@$!%*?&)');
    });
  });

  describe('validatePhone', () => {
    it('应该验证有效的手机号', () => {
      const validPhones = ['13812345678', '15987654321', '18612345678'];
      validPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('应该接受空手机号（可选字段）', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝格式错误的手机号', () => {
      const invalidPhones = [
        'abc123',
        '123',
        '123-abc-456'
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('手机号格式不正确');
      });
    });
  });

  describe('validateFullName', () => {
    it('应该验证有效的姓名', () => {
      const result = validateFullName('张三');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该接受空姓名（可选字段）', () => {
      const result = validateFullName('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝过长的姓名', () => {
      const longName = 'a'.repeat(101);
      const result = validateFullName(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('真实姓名长度不能超过100个字符');
    });

    it('应该拒绝包含特殊字符的姓名', () => {
      const result = validateFullName('张三@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('真实姓名只能包含中文、英文字母和空格');
    });
  });

  describe('validateBirthDate', () => {
    it('应该验证有效的生日', () => {
      const result = validateBirthDate('1990-01-01');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该接受空生日（可选字段）', () => {
      const result = validateBirthDate('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝格式错误的生日', () => {
      const result = validateBirthDate('invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('生日格式不正确');
    });

    it('应该拒绝未来的生日', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      const result = validateBirthDate(futureDateStr);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('生日不能是未来日期');
    });

    it('应该拒绝过早的生日（超过150岁）', () => {
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 151);
      const veryOldDateStr = veryOldDate.toISOString().split('T')[0];
      
      const result = validateBirthDate(veryOldDateStr);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('年龄不能超过150岁');
    });
  });

  describe('validateGender', () => {
    it('应该验证有效的性别', () => {
      const validGenders = ['male', 'female', 'other'];
      
      validGenders.forEach(gender => {
        const result = validateGender(gender);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('应该接受空性别（可选字段）', () => {
      const result = validateGender('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝无效的性别', () => {
      const result = validateGender('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('性别值不正确，只能是 male、female 或 other');
    });
  });

  describe('validateStatus', () => {
    it('应该验证有效的状态', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'deleted'];
      
      validStatuses.forEach(status => {
        const result = validateStatus(status);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('应该拒绝无效的状态', () => {
      const result = validateStatus('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('用户状态值不正确');
    });
  });

  describe('validateAvatarUrl', () => {
    it('应该验证有效的头像URL', () => {
      const result = validateAvatarUrl('https://example.com/avatar.jpg');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该接受空头像URL（可选字段）', () => {
      const result = validateAvatarUrl('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝无效的URL格式', () => {
      const result = validateAvatarUrl('invalid-url');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('头像URL格式不正确');
    });

    it('应该拒绝过长的URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500);
      const result = validateAvatarUrl(longUrl);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('头像URL长度不能超过500个字符');
    });
  });

  describe('validateUserCreation', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      full_name: '测试用户',
      phone: '13800138000',
      birth_date: '1990-01-01',
      gender: 'male'
    };

    it('应该验证有效的用户创建数据', () => {
      const result = validateUserCreation(validUserData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝缺少必填字段的数据', () => {
      const incompleteData = { ...validUserData };
      delete incompleteData.username;
      
      const result = validateUserCreation(incompleteData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('用户名'))).toBe(true);
    });

    it('应该验证所有字段的格式', () => {
      const invalidData = {
        username: '12', // 太短
        email: 'invalid-email', // 格式错误
        password: '123', // 太短
        phone: 'abc', // 格式错误
        gender: 'invalid' // 无效值
      };
      
      const result = validateUserCreation(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateUserUpdate', () => {
    it('应该验证有效的用户更新数据', () => {
      const updateData = {
        full_name: '新姓名',
        phone: '13900139000'
      };
      
      const result = validateUserUpdate(updateData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该允许部分字段更新', () => {
      const updateData = {
        full_name: '新姓名'
      };
      
      const result = validateUserUpdate(updateData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该允许更新所有可更新字段', () => {
      const updateData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'NewPassword123!',
        full_name: '新用户名'
      };
      
      const result = validateUserUpdate(updateData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validatePaginationParams', () => {
    it('应该验证有效的分页参数', () => {
      const params = {
        page: 1,
        limit: 10,
        sort: 'created_at',
        order: 'DESC'
      };
      
      const result = validatePaginationParams(params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该使用默认值处理空参数', () => {
      const result = validatePaginationParams({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝无效的分页参数', () => {
      const params = {
        page: 0, // 无效页码
        limit: 101, // 超过限制
        order: 'INVALID' // 无效排序
      };
      
      const result = validatePaginationParams(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});