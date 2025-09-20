/**
 * 用户数据验证层
 * 提供用户数据的输入验证和业务逻辑验证
 */

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} 验证结果
 */
export const validateUsername = (username) => {
  const errors = [];

  if (!username) {
    errors.push('用户名不能为空');
  } else {
    if (username.length < 3) {
      errors.push('用户名长度不能少于3个字符');
    }
    if (username.length > 50) {
      errors.push('用户名长度不能超过50个字符');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('用户名只能包含字母、数字和下划线');
    }
    if (/^[0-9]/.test(username)) {
      errors.push('用户名不能以数字开头');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {Object} 验证结果
 */
export const validateEmail = (email) => {
  const errors = [];

  if (!email) {
    errors.push('邮箱地址不能为空');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('邮箱地址格式不正确');
    }
    if (email.length > 100) {
      errors.push('邮箱地址长度不能超过100个字符');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('密码不能为空');
  } else {
    if (password.length < 6) {
      errors.push('密码长度不能少于6个字符');
    }
    if (password.length > 128) {
      errors.push('密码长度不能超过128个字符');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('密码必须包含至少一个小写字母');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('密码必须包含至少一个大写字母');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('密码必须包含至少一个数字');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('密码必须包含至少一个特殊字符(@$!%*?&)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {Object} 验证结果
 */
export const validatePhone = (phone) => {
  const errors = [];

  if (phone) {
    // 中国大陆手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      errors.push('手机号格式不正确');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证真实姓名
 * @param {string} fullName - 真实姓名
 * @returns {Object} 验证结果
 */
export const validateFullName = (fullName) => {
  const errors = [];

  if (fullName) {
    if (fullName.length < 2) {
      errors.push('真实姓名长度不能少于2个字符');
    }
    if (fullName.length > 100) {
      errors.push('真实姓名长度不能超过100个字符');
    }
    if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(fullName)) {
      errors.push('真实姓名只能包含中文、英文字母和空格');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证生日
 * @param {string} birthDate - 生日（YYYY-MM-DD格式）
 * @returns {Object} 验证结果
 */
export const validateBirthDate = (birthDate) => {
  const errors = [];

  if (birthDate) {
    const date = new Date(birthDate);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      errors.push('生日格式不正确');
    } else {
      if (date > now) {
        errors.push('生日不能是未来日期');
      }
      
      const age = now.getFullYear() - date.getFullYear();
      if (age > 150) {
        errors.push('年龄不能超过150岁');
      }
      if (age < 0) {
        errors.push('生日不能是未来日期');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证性别
 * @param {string} gender - 性别
 * @returns {Object} 验证结果
 */
export const validateGender = (gender) => {
  const errors = [];

  if (gender) {
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender)) {
      errors.push('性别值不正确，只能是 male、female 或 other');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证用户状态
 * @param {string} status - 用户状态
 * @returns {Object} 验证结果
 */
export const validateStatus = (status) => {
  const errors = [];

  if (status) {
    const validStatuses = ['active', 'inactive', 'suspended', 'deleted'];
    if (!validStatuses.includes(status)) {
      errors.push('用户状态值不正确');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证头像URL
 * @param {string} avatarUrl - 头像URL
 * @returns {Object} 验证结果
 */
export const validateAvatarUrl = (avatarUrl) => {
  const errors = [];

  if (avatarUrl) {
    try {
      new URL(avatarUrl);
      if (avatarUrl.length > 500) {
        errors.push('头像URL长度不能超过500个字符');
      }
    } catch {
      errors.push('头像URL格式不正确');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证用户创建数据
 * @param {Object} userData - 用户数据
 * @returns {Object} 验证结果
 */
export const validateUserCreation = (userData) => {
  const errors = [];
  
  // 必填字段验证
  const usernameValidation = validateUsername(userData.username);
  if (!usernameValidation.isValid) {
    errors.push(...usernameValidation.errors);
  }

  const emailValidation = validateEmail(userData.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  // 可选字段验证
  if (userData.full_name) {
    const fullNameValidation = validateFullName(userData.full_name);
    if (!fullNameValidation.isValid) {
      errors.push(...fullNameValidation.errors);
    }
  }

  if (userData.phone) {
    const phoneValidation = validatePhone(userData.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
  }

  if (userData.birth_date) {
    const birthDateValidation = validateBirthDate(userData.birth_date);
    if (!birthDateValidation.isValid) {
      errors.push(...birthDateValidation.errors);
    }
  }

  if (userData.gender) {
    const genderValidation = validateGender(userData.gender);
    if (!genderValidation.isValid) {
      errors.push(...genderValidation.errors);
    }
  }

  if (userData.avatar_url) {
    const avatarValidation = validateAvatarUrl(userData.avatar_url);
    if (!avatarValidation.isValid) {
      errors.push(...avatarValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证用户更新数据
 * @param {Object} userData - 用户数据
 * @returns {Object} 验证结果
 */
export const validateUserUpdate = (userData) => {
  const errors = [];
  
  // 可选字段验证（更新时所有字段都是可选的）
  if (userData.username !== undefined) {
    const usernameValidation = validateUsername(userData.username);
    if (!usernameValidation.isValid) {
      errors.push(...usernameValidation.errors);
    }
  }

  if (userData.email !== undefined) {
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }

  if (userData.password !== undefined) {
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (userData.full_name !== undefined) {
    const fullNameValidation = validateFullName(userData.full_name);
    if (!fullNameValidation.isValid) {
      errors.push(...fullNameValidation.errors);
    }
  }

  if (userData.phone !== undefined) {
    const phoneValidation = validatePhone(userData.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
  }

  if (userData.birth_date !== undefined) {
    const birthDateValidation = validateBirthDate(userData.birth_date);
    if (!birthDateValidation.isValid) {
      errors.push(...birthDateValidation.errors);
    }
  }

  if (userData.gender !== undefined) {
    const genderValidation = validateGender(userData.gender);
    if (!genderValidation.isValid) {
      errors.push(...genderValidation.errors);
    }
  }

  if (userData.status !== undefined) {
    const statusValidation = validateStatus(userData.status);
    if (!statusValidation.isValid) {
      errors.push(...statusValidation.errors);
    }
  }

  if (userData.avatar_url !== undefined) {
    const avatarValidation = validateAvatarUrl(userData.avatar_url);
    if (!avatarValidation.isValid) {
      errors.push(...avatarValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证分页参数
 * @param {Object} params - 分页参数
 * @returns {Object} 验证结果
 */
export const validatePaginationParams = (params) => {
  const errors = [];
  const { page, limit } = params;

  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('页码必须是大于0的整数');
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('每页数量必须是1-100之间的整数');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};