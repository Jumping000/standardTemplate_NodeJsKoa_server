import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    
    // 测试文件匹配模式
    include: ['test/**/*.test.js'],
    
    // 全局设置
    globals: true,
    
    // 测试超时时间
    testTimeout: 10000,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'coverage/',
        '*.config.js',
        'app.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // 设置测试环境变量
    env: {
      NODE_ENV: 'test'
    }
  }
});