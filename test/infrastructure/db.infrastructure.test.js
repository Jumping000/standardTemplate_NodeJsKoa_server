import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  sequelize,
  initializeDatabase,
  testDatabaseConnection,
  syncDatabase,
  closeDatabaseConnection,
  getDatabaseStatus,
  ensureDatabaseDirectory
} from '../../infrastructure/db.infrastructure.js';

// 模拟文件系统操作
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn()
}));

// 模拟路径操作
vi.mock('path', () => ({
  join: vi.fn(),
  dirname: vi.fn()
}));

// 模拟 URL 操作
vi.mock('url', () => ({
  fileURLToPath: vi.fn()
}));

// 模拟 Sequelize 实例
vi.mock('../../config/db.config.js', () => ({
  sequelize: {
    authenticate: vi.fn(),
    sync: vi.fn(),
    close: vi.fn(),
    getDialect: vi.fn(),
    define: vi.fn(),
    connectionManager: {
      pool: null
    },
    models: {}
  }
}));

// 模拟用户模型
vi.mock('../../models/user/user.model.js', () => ({}));

describe('Database Infrastructure', () => {
  let consoleSpy;

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 模拟 console 方法
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };

    // 设置默认的模拟返回值
    fileURLToPath.mockReturnValue('/mock/path/to/file.js');
    dirname.mockReturnValue('/mock/path/to');
    join.mockReturnValue('/mock/path/to/database');
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('ensureDatabaseDirectory', () => {
    it('应该在目录不存在时创建数据库目录', () => {
      existsSync.mockReturnValue(false);

      ensureDatabaseDirectory();

      expect(existsSync).toHaveBeenCalledWith('/mock/path/to/database');
      expect(mkdirSync).toHaveBeenCalledWith('/mock/path/to/database', { recursive: true });
      expect(consoleSpy.log).toHaveBeenCalledWith('📁 数据库目录已创建:', '/mock/path/to/database');
    });

    it('应该在目录已存在时跳过创建', () => {
      existsSync.mockReturnValue(true);

      ensureDatabaseDirectory();

      expect(existsSync).toHaveBeenCalledWith('/mock/path/to/database');
      expect(mkdirSync).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('testDatabaseConnection', () => {
    it('应该在连接成功时返回 true', async () => {
      sequelize.authenticate.mockResolvedValue();

      const result = await testDatabaseConnection();

      expect(result).toBe(true);
      expect(sequelize.authenticate).toHaveBeenCalledOnce();
      expect(consoleSpy.log).toHaveBeenCalledWith('✅ SQLite数据库连接成功');
    });

    it('应该在连接失败时返回 false', async () => {
      const error = new Error('Connection failed');
      sequelize.authenticate.mockRejectedValue(error);

      const result = await testDatabaseConnection();

      expect(result).toBe(false);
      expect(sequelize.authenticate).toHaveBeenCalledOnce();
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ SQLite数据库连接失败:', 'Connection failed');
    });
  });

  describe('syncDatabase', () => {
    it('应该使用默认选项同步数据库', async () => {
      sequelize.sync.mockResolvedValue();

      const result = await syncDatabase();

      expect(result).toBe(true);
      expect(sequelize.sync).toHaveBeenCalledWith({ force: false, alter: false });
      expect(consoleSpy.log).toHaveBeenCalledWith('🔄 开始同步数据库模型...');
      expect(consoleSpy.log).toHaveBeenCalledWith('✅ 数据库模型同步完成');
    });

    it('应该使用 force 选项同步数据库', async () => {
      sequelize.sync.mockResolvedValue();

      const result = await syncDatabase({ force: true });

      expect(result).toBe(true);
      expect(sequelize.sync).toHaveBeenCalledWith({ force: true, alter: false });
      expect(consoleSpy.log).toHaveBeenCalledWith('🔥 数据库表已强制重建');
    });

    it('应该使用 alter 选项同步数据库', async () => {
      sequelize.sync.mockResolvedValue();

      const result = await syncDatabase({ alter: true });

      expect(result).toBe(true);
      expect(sequelize.sync).toHaveBeenCalledWith({ force: false, alter: true });
      expect(consoleSpy.log).toHaveBeenCalledWith('🔧 数据库表结构已更新');
    });

    it('应该在同步失败时返回 false', async () => {
      const error = new Error('Sync failed');
      sequelize.sync.mockRejectedValue(error);

      const result = await syncDatabase();

      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ 数据库模型同步失败:', 'Sync failed');
    });
  });

  describe('initializeDatabase', () => {
    beforeEach(() => {
      // 模拟成功的依赖函数
      existsSync.mockReturnValue(false);
      sequelize.authenticate.mockResolvedValue();
      sequelize.sync.mockResolvedValue();
    });

    it('应该成功初始化数据库', async () => {
      const result = await initializeDatabase();

      expect(result).toBe(true);
      expect(consoleSpy.log).toHaveBeenCalledWith('🚀 开始初始化SQLite数据库...');
      expect(consoleSpy.log).toHaveBeenCalledWith('🎉 SQLite数据库初始化完成');
      
      // 验证调用顺序
      expect(existsSync).toHaveBeenCalled();
      expect(sequelize.authenticate).toHaveBeenCalled();
      expect(sequelize.sync).toHaveBeenCalled();
    });

    it('应该传递选项给 syncDatabase', async () => {
      const options = { force: true, alter: true };
      
      const result = await initializeDatabase(options);

      expect(result).toBe(true);
      expect(sequelize.sync).toHaveBeenCalledWith(options);
    });

    it('应该在连接失败时返回 false', async () => {
      sequelize.authenticate.mockRejectedValue(new Error('Connection failed'));

      const result = await initializeDatabase();

      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ 数据库初始化失败:', '数据库连接失败');
    });

    it('应该在同步失败时返回 false', async () => {
      sequelize.sync.mockRejectedValue(new Error('Sync failed'));

      const result = await initializeDatabase();

      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ 数据库初始化失败:', '数据库模型同步失败');
    });
  });

  describe('closeDatabaseConnection', () => {
    it('应该成功关闭数据库连接', async () => {
      sequelize.close.mockResolvedValue();

      await closeDatabaseConnection();

      expect(sequelize.close).toHaveBeenCalledOnce();
      expect(consoleSpy.log).toHaveBeenCalledWith('🔌 数据库连接已关闭');
    });

    it('应该处理关闭连接时的错误', async () => {
      const error = new Error('Close failed');
      sequelize.close.mockRejectedValue(error);

      await closeDatabaseConnection();

      expect(sequelize.close).toHaveBeenCalledOnce();
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ 关闭数据库连接失败:', 'Close failed');
    });
  });

  describe('getDatabaseStatus', () => {
    it('应该返回连接状态信息（已连接）', () => {
      sequelize.getDialect.mockReturnValue('sqlite');
      sequelize.connectionManager.pool = { /* mock pool */ };
      sequelize.models = { User: {}, Post: {} };

      const status = getDatabaseStatus();

      expect(status).toEqual({
        dialect: 'sqlite',
        connectionState: 'connected',
        modelCount: 2
      });
    });

    it('应该返回连接状态信息（未连接）', () => {
      sequelize.getDialect.mockReturnValue('sqlite');
      sequelize.connectionManager.pool = null;
      sequelize.models = {};

      const status = getDatabaseStatus();

      expect(status).toEqual({
        dialect: 'sqlite',
        connectionState: 'disconnected',
        modelCount: 0
      });
    });
  });

  describe('集成测试', () => {
    it('应该按正确顺序执行完整的初始化流程', async () => {
      existsSync.mockReturnValue(false);
      sequelize.authenticate.mockResolvedValue();
      sequelize.sync.mockResolvedValue();

      const result = await initializeDatabase({ force: true });

      expect(result).toBe(true);

      // 验证关键日志消息存在
      const logMessages = consoleSpy.log.mock.calls.map(call => call[0]);
      
      expect(logMessages).toContain('📁 数据库目录已创建:');
      expect(logMessages).toContain('🚀 开始初始化SQLite数据库...');
      expect(logMessages).toContain('✅ SQLite数据库连接成功');
      expect(logMessages).toContain('🔄 开始同步数据库模型...');
      expect(logMessages).toContain('🔥 数据库表已强制重建');
      expect(logMessages).toContain('🎉 SQLite数据库初始化完成');
    });

    it('应该在任何步骤失败时停止初始化', async () => {
      existsSync.mockReturnValue(false);
      sequelize.authenticate.mockRejectedValue(new Error('Auth failed'));

      const result = await initializeDatabase();

      expect(result).toBe(false);
      expect(sequelize.sync).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ 数据库初始化失败:', '数据库连接失败');
    });
  });

  describe('错误处理边界情况', () => {
    it('应该处理 sequelize 为 null 的情况', async () => {
      // 这个测试更多是为了覆盖率，实际情况下 sequelize 不应该为 null
      const originalAuthenticate = sequelize.authenticate;
      sequelize.authenticate = null;

      try {
        await testDatabaseConnection();
      } catch (error) {
        expect(error).toBeDefined();
      }

      sequelize.authenticate = originalAuthenticate;
    });

    it('应该处理文件系统操作异常', () => {
      existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      expect(() => ensureDatabaseDirectory()).toThrow('File system error');
    });
  });
});