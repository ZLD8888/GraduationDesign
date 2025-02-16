CREATE TABLE health_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    heart_rate INT NOT NULL COMMENT '心率值',
    timestamp DATETIME NOT NULL COMMENT '数据时间戳',
    is_abnormal BOOLEAN DEFAULT FALSE COMMENT '是否异常',
    device_id VARCHAR(50) COMMENT '设备ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_time (user_id, timestamp)
);

-- 老人信息表
CREATE TABLE IF NOT EXISTS elderly_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender VARCHAR(10) COMMENT '性别',
    age INT COMMENT '年龄',
    room_number VARCHAR(20) COMMENT '房间号',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 护工-老人关系表
CREATE TABLE IF NOT EXISTS staff_elderly_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL COMMENT '护工ID',
    elderly_id BIGINT NOT NULL COMMENT '老人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_staff_elderly (staff_id, elderly_id)
);

-- 家属-老人关系表
CREATE TABLE IF NOT EXISTS family_elderly_relation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    family_id BIGINT NOT NULL COMMENT '家属ID',
    elderly_id BIGINT NOT NULL COMMENT '老人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_family_elderly (family_id, elderly_id)
);