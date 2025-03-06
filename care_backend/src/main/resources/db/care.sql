/*
 Navicat Premium Data Transfer

 Source Server         : text
 Source Server Type    : MySQL
 Source Server Version : 50729
 Source Host           : localhost:3306
 Source Schema         : care

 Target Server Type    : MySQL
 Target Server Version : 50729
 File Encoding         : 65001

 Date: 06/03/2025 12:17:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activities
-- ----------------------------
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动描述',
  `start_time` datetime(0) NOT NULL COMMENT '开始时间',
  `end_time` datetime(0) NOT NULL COMMENT '结束时间',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动地点',
  `max_participants` int(11) NOT NULL COMMENT '最大参与人数',
  `current_participants` int(11) NOT NULL DEFAULT 0 COMMENT '当前参与人数',
  `activity_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动状态(PLANNED/ONGOING/COMPLETED/CANCELLED)',
  `organizer_id` bigint(20) NOT NULL COMMENT '组织者ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `organizer_id`(`organizer_id`) USING BTREE,
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '活动表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of activities
-- ----------------------------
INSERT INTO `activities` VALUES (1, '活动1', '这是一个示例活动', '2025-01-24 10:00:00', '2025-02-12 12:00:00', '活动地点1', 50, 2, 'COMPLETED', 1, '2025-02-27 19:20:26', '2025-02-27 19:20:26');
INSERT INTO `activities` VALUES (2, '活动2', '这是另一个示例活动', '2023-01-02 14:00:00', '2023-01-02 16:00:00', '活动地点2', 30, 1, 'COMPLETED', 2, '2025-02-04 15:44:07', '2025-02-04 15:44:07');
INSERT INTO `activities` VALUES (3, '活动3', '这是第三个示例活动', '2023-01-03 16:00:00', '2023-01-03 18:00:00', '活动地点3', 20, 0, 'COMPLETED', 3, '2025-01-27 17:20:45', '2025-01-27 17:20:45');
INSERT INTO `activities` VALUES (4, '活动4', '这是第三个示例活动', '2023-01-03 16:00:00', '2023-01-03 18:00:00', '活动地点4', 20, 0, 'CANCELLED', 3, '2025-02-04 19:25:16', '2023-01-03 15:00:00');
INSERT INTO `activities` VALUES (5, '测试1', '12312312321321313213123131323123213123', '2025-02-08 16:10:00', '2025-02-08 22:00:00', '会议室', 10, 1, 'COMPLETED', 1, '2025-02-09 00:14:23', '2025-02-09 00:14:23');

-- ----------------------------
-- Table structure for activity_participants
-- ----------------------------
DROP TABLE IF EXISTS `activity_participants`;
CREATE TABLE `activity_participants`  (
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `elderly_id` bigint(20) NOT NULL COMMENT '老人ID',
  PRIMARY KEY (`activity_id`, `elderly_id`) USING BTREE,
  INDEX `elderly_id`(`elderly_id`) USING BTREE,
  CONSTRAINT `activity_participants_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '活动参与者关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of activity_participants
-- ----------------------------
INSERT INTO `activity_participants` VALUES (1, 2);
INSERT INTO `activity_participants` VALUES (1, 3);
INSERT INTO `activity_participants` VALUES (5, 3);

-- ----------------------------
-- Table structure for appointments
-- ----------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `appointment_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约编号',
  `service_id` bigint(20) NOT NULL COMMENT '关联的服务ID',
  `service_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '服务名称',
  `price` decimal(10, 2) NOT NULL COMMENT '服务费用',
  `elderly_id_card` bigint(20) NOT NULL COMMENT '预约老人身份证ID',
  `elderly_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约老人姓名',
  `elderly_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约老人电话',
  `appointment_time` datetime(0) NOT NULL COMMENT '预约时间',
  `time_slot_id` bigint(20) NOT NULL COMMENT '关联的时间段ID',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约状态：PENDING-待确认/CONFIRMED-已确认/COMPLETED-已完成/CANCELLED-已取消',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '备注信息',
  `create_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `creator_id` bigint(20) NOT NULL COMMENT '创建人ID（可能是老人本人或家属）',
  `creator_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建人类型：ELDERLY-老人/FAMILY-家属',
  PRIMARY KEY (`id`, `elderly_id_card`, `elderly_phone`) USING BTREE,
  INDEX `idx_elderly_id`(`elderly_id_card`) USING BTREE,
  INDEX `idx_service_id`(`service_id`) USING BTREE,
  INDEX `idx_appointment_time`(`appointment_time`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '预约服务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of appointments
-- ----------------------------
INSERT INTO `appointments` VALUES (1, 'AP202302010001', 1, '陪护服务', 100.00, 1, '张三', '13800138000', '2023-02-01 08:00:00', 1, 'PENDING', '需要全天陪护', '2025-02-04 16:38:25', '2025-02-04 16:38:25', 1, 'ELDERLY');
INSERT INTO `appointments` VALUES (2, 'AP202302010002', 2, '医疗检查', 150.00, 2, '李四', '13900139000', '2023-02-01 09:00:00', 3, 'CONFIRMED', '定期检查', '2025-02-04 16:38:25', '2025-02-04 16:38:25', 2, 'FAMILY');
INSERT INTO `appointments` VALUES (3, 'AP202302010003', 3, '外出探视', 200.00, 3, '王五', '13700137000', '2023-02-01 10:00:00', 4, 'COMPLETED', '外出购物', '2025-02-04 16:38:25', '2025-02-04 16:38:25', 3, 'FAMILY');
INSERT INTO `appointments` VALUES (4, 'AP202302010004', 4, '康复训练', 120.00, 1, '张三', '13800138000', '2023-02-01 14:00:00', 5, 'CANCELLED', '需要取消', '2025-02-04 16:38:25', '2025-02-04 16:38:25', 1, 'ELDERLY');

-- ----------------------------
-- Table structure for appointments_user
-- ----------------------------
DROP TABLE IF EXISTS `appointments_user`;
CREATE TABLE `appointments_user`  (
  `appointment_no` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约编号',
  `user_id` int(10) NOT NULL COMMENT '预约人ID,登录预约人的ID，可能是老人自己也可能是家属',
  `service_id` int(10) NOT NULL COMMENT '服务ID',
  `elderly_id` int(10) NOT NULL COMMENT '实际需要服务的老人',
  `data` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约日期',
  `time` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约时间段',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '预约状态：PENDING-待确认/CONFIRMED-已确认/COMPLETED-已完成/CANCELLED-已取消',
  `create_time` datetime(0) NOT NULL COMMENT '创建时间',
  `update_time` datetime(0) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`appointment_no`, `user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of appointments_user
-- ----------------------------
INSERT INTO `appointments_user` VALUES ('1', 1, 17, 1, '2025-02-07', '15:21', 'COMPLETED', '2025-02-05 15:21:29', '2025-02-08 13:21:15');
INSERT INTO `appointments_user` VALUES ('APPT-1738744986996-973', 6, 17, 6, '2025-02-10', '00:30', 'COMPLETED', '2025-02-05 16:43:07', '2025-02-27 19:20:27');
INSERT INTO `appointments_user` VALUES ('APPT-1738766374978-738', 3, 17, 3, '2025-02-07', '00:30', 'COMPLETED', '2025-02-05 22:39:35', '2025-02-08 13:21:15');
INSERT INTO `appointments_user` VALUES ('APPT-1738766818470-246', 3, 17, 3, '2025-02-10', '00:00', 'COMPLETED', '2025-02-05 22:46:59', '2025-02-27 19:20:27');
INSERT INTO `appointments_user` VALUES ('APPT-1738767030288-488', 3, 17, 3, '2025-02-14', '00:00', 'COMPLETED', '2025-02-05 22:50:30', '2025-02-27 19:20:27');
INSERT INTO `appointments_user` VALUES ('APPT-1738767297811-527', 3, 17, 3, '2025-02-17', '00:00', 'CANCELLED', '2025-02-05 22:54:58', '2025-02-05 22:54:58');
INSERT INTO `appointments_user` VALUES ('APPT-1739002074445-210', 7, 18, 3, '2025-02-08', '16:30', 'COMPLETED', '2025-02-08 16:07:54', '2025-02-08 16:30:12');
INSERT INTO `appointments_user` VALUES ('APPT-1739002074445-211', 7, 18, 3, '2025-02-08', '17:00', 'COMPLETED', '2025-02-08 16:07:54', '2025-02-08 19:29:26');
INSERT INTO `appointments_user` VALUES ('APPT-1740883513275-356', 3, 18, 3, '2025-04-01', '09:30', 'CANCELLED', '2025-03-02 10:45:13', '2025-03-02 10:45:13');

-- ----------------------------
-- Table structure for elderly_device
-- ----------------------------
DROP TABLE IF EXISTS `elderly_device`;
CREATE TABLE `elderly_device`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `elderly_users_id` bigint(20) NOT NULL,
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '1: 绑定中, 0: 已解绑',
  `create_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_elderly_device`(`elderly_users_id`, `device_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of elderly_device
-- ----------------------------
INSERT INTO `elderly_device` VALUES (1, 7, '1', 1, '2025-03-06 09:47:18', '2025-03-06 09:47:18');

-- ----------------------------
-- Table structure for elderly_info
-- ----------------------------
DROP TABLE IF EXISTS `elderly_info`;
CREATE TABLE `elderly_info`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '老人ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `gender` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '性别',
  `birth_date` date NOT NULL COMMENT '出生日期',
  `id_card` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '身份证号',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '老人电话',
  `bed_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '床位号',
  `check_in_date` date NOT NULL COMMENT '入院日期',
  `caregiver_id` bigint(20) NULL DEFAULT NULL COMMENT '护工ID',
  `health_condition` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '健康状况',
  `dietary_restrictions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '饮食限制',
  `emergency_contact_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系人姓名',
  `emergency_contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系人电话',
  `created_at` datetime(0) NOT NULL COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`, `id_card`, `phone`) USING BTREE,
  UNIQUE INDEX `id_card`(`id_card`) USING BTREE,
  INDEX `caregiver_id`(`caregiver_id`) USING BTREE,
  CONSTRAINT `elderly_info_ibfk_1` FOREIGN KEY (`caregiver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '老人信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of elderly_info
-- ----------------------------
INSERT INTO `elderly_info` VALUES (2, '1', '男', '1980-01-24', '371525200212291715', '122', '1', '2025-01-24', 2, '1', '1', '1', '13', '2025-01-24 14:56:32', '2025-01-24 14:56:32');
INSERT INTO `elderly_info` VALUES (3, '2', '女', '2025-01-24', '522631198510180054', '13336356001', '2', '2025-01-24', 2, '1', '1', '1', '1', '2025-01-24 20:14:06', '2025-01-24 20:14:06');
INSERT INTO `elderly_info` VALUES (9, '3', '男', '2025-01-24', '522631198510180055', '', '3', '2025-01-24', 2, '1', '1', '1', '1', '2025-01-24 22:46:15', '2025-01-24 22:46:15');
INSERT INTO `elderly_info` VALUES (10, '4', '男', '2025-01-24', '522631198510180056', '', '4', '2025-01-24', 2, '1', '1', '1', '1', '2025-01-24 22:51:52', '2025-01-25 00:15:22');
INSERT INTO `elderly_info` VALUES (11, 'd', '女', '2005-03-03', '522631198510180057', '', '5', '2025-02-03', 15, '1', '1', '1', '12', '2025-02-03 15:22:06', '2025-02-03 15:22:39');
INSERT INTO `elderly_info` VALUES (12, '张三', '男', '2025-03-06', '371525200112191715', '16666668888', '7', '2025-03-06', 15, '1', '1', '1', '1', '2025-03-06 12:04:11', '2025-03-06 12:04:11');

-- ----------------------------
-- Table structure for family_elderly
-- ----------------------------
DROP TABLE IF EXISTS `family_elderly`;
CREATE TABLE `family_elderly`  (
  `family_userid` int(10) NOT NULL COMMENT '绑定老人的家属登录账号ID',
  `elderly_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '绑定老人信息的身份证号',
  PRIMARY KEY (`family_userid`, `elderly_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of family_elderly
-- ----------------------------
INSERT INTO `family_elderly` VALUES (4, '371525200212291715');
INSERT INTO `family_elderly` VALUES (4, '522631198510180054');

-- ----------------------------
-- Table structure for health_data
-- ----------------------------
DROP TABLE IF EXISTS `health_data`;
CREATE TABLE `health_data`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `heart_rate` int(11) NOT NULL COMMENT '心率值',
  `timestamp` datetime(0) NOT NULL COMMENT '数据时间戳',
  `is_abnormal` tinyint(1) NULL DEFAULT 0 COMMENT '是否异常',
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '设备ID',
  `create_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_time`(`user_id`, `timestamp`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 94 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of health_data
-- ----------------------------
INSERT INTO `health_data` VALUES (6, 7, 86, '2025-03-06 10:17:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:17:35', '2025-03-06 10:17:35');
INSERT INTO `health_data` VALUES (7, 7, 94, '2025-03-06 10:18:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:18:35', '2025-03-06 10:18:35');
INSERT INTO `health_data` VALUES (8, 7, 96, '2025-03-06 10:19:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:19:35', '2025-03-06 10:19:35');
INSERT INTO `health_data` VALUES (9, 7, 95, '2025-03-06 10:20:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:20:35', '2025-03-06 10:20:35');
INSERT INTO `health_data` VALUES (10, 7, 70, '2025-03-06 10:21:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:21:35', '2025-03-06 10:21:35');
INSERT INTO `health_data` VALUES (11, 7, 68, '2025-03-06 10:22:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:22:35', '2025-03-06 10:22:35');
INSERT INTO `health_data` VALUES (12, 7, 75, '2025-03-06 10:23:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:23:35', '2025-03-06 10:23:35');
INSERT INTO `health_data` VALUES (13, 7, 72, '2025-03-06 10:24:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:24:35', '2025-03-06 10:24:35');
INSERT INTO `health_data` VALUES (14, 7, 87, '2025-03-06 10:25:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:25:35', '2025-03-06 10:25:35');
INSERT INTO `health_data` VALUES (15, 7, 60, '2025-03-06 10:26:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:26:35', '2025-03-06 10:26:35');
INSERT INTO `health_data` VALUES (16, 7, 86, '2025-03-06 10:27:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:27:35', '2025-03-06 10:27:35');
INSERT INTO `health_data` VALUES (17, 7, 92, '2025-03-06 10:28:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:28:35', '2025-03-06 10:28:35');
INSERT INTO `health_data` VALUES (18, 7, 69, '2025-03-06 10:29:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:29:35', '2025-03-06 10:29:35');
INSERT INTO `health_data` VALUES (19, 7, 70, '2025-03-06 10:30:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:30:35', '2025-03-06 10:30:35');
INSERT INTO `health_data` VALUES (20, 7, 85, '2025-03-06 10:31:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:31:35', '2025-03-06 10:31:35');
INSERT INTO `health_data` VALUES (21, 7, 83, '2025-03-06 10:32:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:32:35', '2025-03-06 10:32:35');
INSERT INTO `health_data` VALUES (22, 7, 69, '2025-03-06 10:33:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:33:35', '2025-03-06 10:33:35');
INSERT INTO `health_data` VALUES (23, 7, 68, '2025-03-06 10:34:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:34:35', '2025-03-06 10:34:35');
INSERT INTO `health_data` VALUES (24, 7, 93, '2025-03-06 10:35:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:35:35', '2025-03-06 10:35:35');
INSERT INTO `health_data` VALUES (25, 7, 71, '2025-03-06 10:36:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:36:35', '2025-03-06 10:36:35');
INSERT INTO `health_data` VALUES (26, 7, 99, '2025-03-06 10:37:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:37:35', '2025-03-06 10:37:35');
INSERT INTO `health_data` VALUES (27, 7, 95, '2025-03-06 10:38:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:38:35', '2025-03-06 10:38:35');
INSERT INTO `health_data` VALUES (28, 7, 72, '2025-03-06 10:39:35', 0, 'MOCK-DEVICE-7', '2025-03-06 10:39:35', '2025-03-06 10:39:35');
INSERT INTO `health_data` VALUES (29, 7, 81, '2025-03-06 11:00:29', 0, 'MOCK-DEVICE-7', '2025-03-06 11:00:29', '2025-03-06 11:00:29');
INSERT INTO `health_data` VALUES (30, 7, 82, '2025-03-06 11:01:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:01:28', '2025-03-06 11:01:28');
INSERT INTO `health_data` VALUES (31, 7, 68, '2025-03-06 11:02:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:02:28', '2025-03-06 11:02:28');
INSERT INTO `health_data` VALUES (32, 7, 93, '2025-03-06 11:03:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:03:28', '2025-03-06 11:03:28');
INSERT INTO `health_data` VALUES (33, 7, 85, '2025-03-06 11:04:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:04:28', '2025-03-06 11:04:28');
INSERT INTO `health_data` VALUES (34, 7, 81, '2025-03-06 11:05:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:05:28', '2025-03-06 11:05:28');
INSERT INTO `health_data` VALUES (35, 7, 73, '2025-03-06 11:06:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:06:28', '2025-03-06 11:06:28');
INSERT INTO `health_data` VALUES (36, 7, 103, '2025-03-06 11:07:28', 1, 'MOCK-DEVICE-7', '2025-03-06 11:07:28', '2025-03-06 11:07:28');
INSERT INTO `health_data` VALUES (37, 7, 81, '2025-03-06 11:08:28', 0, 'MOCK-DEVICE-7', '2025-03-06 11:08:28', '2025-03-06 11:08:28');
INSERT INTO `health_data` VALUES (38, 7, 111, '2025-03-06 11:09:28', 1, 'MOCK-DEVICE-7', '2025-03-06 11:09:28', '2025-03-06 11:09:28');
INSERT INTO `health_data` VALUES (39, 7, 57, '2025-03-06 11:10:28', 1, 'MOCK-DEVICE-7', '2025-03-06 11:10:28', '2025-03-06 11:10:28');
INSERT INTO `health_data` VALUES (40, 7, 110, '2025-03-06 11:11:14', 1, 'MOCK-DEVICE-7', '2025-03-06 11:11:14', '2025-03-06 11:11:14');
INSERT INTO `health_data` VALUES (41, 7, 96, '2025-03-06 11:12:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:12:14', '2025-03-06 11:12:14');
INSERT INTO `health_data` VALUES (42, 7, 94, '2025-03-06 11:13:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:13:14', '2025-03-06 11:13:14');
INSERT INTO `health_data` VALUES (43, 7, 61, '2025-03-06 11:14:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:14:14', '2025-03-06 11:14:14');
INSERT INTO `health_data` VALUES (44, 7, 95, '2025-03-06 11:15:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:15:14', '2025-03-06 11:15:14');
INSERT INTO `health_data` VALUES (45, 7, 102, '2025-03-06 11:16:14', 1, 'MOCK-DEVICE-7', '2025-03-06 11:16:14', '2025-03-06 11:16:14');
INSERT INTO `health_data` VALUES (46, 7, 79, '2025-03-06 11:17:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:17:14', '2025-03-06 11:17:14');
INSERT INTO `health_data` VALUES (47, 7, 71, '2025-03-06 11:18:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:18:14', '2025-03-06 11:18:14');
INSERT INTO `health_data` VALUES (48, 7, 89, '2025-03-06 11:19:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:19:14', '2025-03-06 11:19:14');
INSERT INTO `health_data` VALUES (49, 7, 86, '2025-03-06 11:20:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:20:14', '2025-03-06 11:20:14');
INSERT INTO `health_data` VALUES (50, 7, 83, '2025-03-06 11:21:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:21:14', '2025-03-06 11:21:14');
INSERT INTO `health_data` VALUES (51, 7, 96, '2025-03-06 11:22:14', 0, 'MOCK-DEVICE-7', '2025-03-06 11:22:14', '2025-03-06 11:22:14');
INSERT INTO `health_data` VALUES (52, 7, 82, '2025-03-06 11:25:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:25:53', '2025-03-06 11:25:53');
INSERT INTO `health_data` VALUES (53, 7, 76, '2025-03-06 11:26:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:26:53', '2025-03-06 11:26:53');
INSERT INTO `health_data` VALUES (54, 7, 87, '2025-03-06 11:27:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:27:53', '2025-03-06 11:27:53');
INSERT INTO `health_data` VALUES (55, 7, 95, '2025-03-06 11:28:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:28:53', '2025-03-06 11:28:53');
INSERT INTO `health_data` VALUES (56, 7, 80, '2025-03-06 11:29:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:29:53', '2025-03-06 11:29:53');
INSERT INTO `health_data` VALUES (57, 7, 78, '2025-03-06 11:30:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:30:53', '2025-03-06 11:30:53');
INSERT INTO `health_data` VALUES (58, 7, 96, '2025-03-06 11:31:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:31:53', '2025-03-06 11:31:53');
INSERT INTO `health_data` VALUES (59, 7, 92, '2025-03-06 11:32:53', 0, 'MOCK-DEVICE-7', '2025-03-06 11:32:53', '2025-03-06 11:32:53');
INSERT INTO `health_data` VALUES (60, 7, 95, '2025-03-06 11:37:17', 0, 'MOCK-DEVICE-7', '2025-03-06 11:37:17', '2025-03-06 11:37:17');
INSERT INTO `health_data` VALUES (61, 7, 95, '2025-03-06 11:38:17', 0, 'MOCK-DEVICE-7', '2025-03-06 11:38:17', '2025-03-06 11:38:17');
INSERT INTO `health_data` VALUES (62, 7, 89, '2025-03-06 11:39:17', 0, 'MOCK-DEVICE-7', '2025-03-06 11:39:17', '2025-03-06 11:39:17');
INSERT INTO `health_data` VALUES (63, 7, 95, '2025-03-06 11:40:17', 0, 'MOCK-DEVICE-7', '2025-03-06 11:40:17', '2025-03-06 11:40:17');
INSERT INTO `health_data` VALUES (64, 7, 86, '2025-03-06 11:48:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:48:30', '2025-03-06 11:48:30');
INSERT INTO `health_data` VALUES (65, 7, 91, '2025-03-06 11:49:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:49:30', '2025-03-06 11:49:30');
INSERT INTO `health_data` VALUES (66, 7, 74, '2025-03-06 11:50:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:50:30', '2025-03-06 11:50:30');
INSERT INTO `health_data` VALUES (67, 7, 84, '2025-03-06 11:51:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:51:30', '2025-03-06 11:51:30');
INSERT INTO `health_data` VALUES (68, 7, 74, '2025-03-06 11:52:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:52:30', '2025-03-06 11:52:30');
INSERT INTO `health_data` VALUES (69, 7, 88, '2025-03-06 11:53:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:53:30', '2025-03-06 11:53:30');
INSERT INTO `health_data` VALUES (70, 7, 71, '2025-03-06 11:54:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:54:30', '2025-03-06 11:54:30');
INSERT INTO `health_data` VALUES (71, 7, 76, '2025-03-06 11:55:30', 0, 'MOCK-DEVICE-7', '2025-03-06 11:55:30', '2025-03-06 11:55:30');
INSERT INTO `health_data` VALUES (72, 7, 91, '2025-03-06 11:56:15', 0, 'MOCK-DEVICE-7', '2025-03-06 11:56:15', '2025-03-06 11:56:15');
INSERT INTO `health_data` VALUES (73, 7, 80, '2025-03-06 11:57:15', 0, 'MOCK-DEVICE-7', '2025-03-06 11:57:15', '2025-03-06 11:57:15');
INSERT INTO `health_data` VALUES (74, 7, 66, '2025-03-06 11:57:43', 0, 'MOCK-DEVICE-7', '2025-03-06 11:57:43', '2025-03-06 11:57:43');
INSERT INTO `health_data` VALUES (75, 7, 68, '2025-03-06 11:58:43', 0, 'MOCK-DEVICE-7', '2025-03-06 11:58:43', '2025-03-06 11:58:43');
INSERT INTO `health_data` VALUES (76, 7, 78, '2025-03-06 11:59:43', 0, 'MOCK-DEVICE-7', '2025-03-06 11:59:43', '2025-03-06 11:59:43');
INSERT INTO `health_data` VALUES (77, 7, 92, '2025-03-06 12:00:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:00:43', '2025-03-06 12:00:43');
INSERT INTO `health_data` VALUES (78, 7, 78, '2025-03-06 12:01:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:01:43', '2025-03-06 12:01:43');
INSERT INTO `health_data` VALUES (79, 7, 91, '2025-03-06 12:02:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:02:43', '2025-03-06 12:02:43');
INSERT INTO `health_data` VALUES (80, 7, 65, '2025-03-06 12:03:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:03:43', '2025-03-06 12:03:43');
INSERT INTO `health_data` VALUES (81, 7, 88, '2025-03-06 12:04:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:04:43', '2025-03-06 12:04:43');
INSERT INTO `health_data` VALUES (82, 7, 90, '2025-03-06 12:05:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:05:43', '2025-03-06 12:05:43');
INSERT INTO `health_data` VALUES (83, 7, 72, '2025-03-06 12:06:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:06:43', '2025-03-06 12:06:43');
INSERT INTO `health_data` VALUES (84, 7, 96, '2025-03-06 12:07:43', 0, 'MOCK-DEVICE-7', '2025-03-06 12:07:43', '2025-03-06 12:07:43');
INSERT INTO `health_data` VALUES (85, 7, 76, '2025-03-06 12:08:33', 0, 'MOCK-DEVICE-7', '2025-03-06 12:08:33', '2025-03-06 12:08:33');
INSERT INTO `health_data` VALUES (86, 7, 97, '2025-03-06 12:09:33', 0, 'MOCK-DEVICE-7', '2025-03-06 12:09:33', '2025-03-06 12:09:33');
INSERT INTO `health_data` VALUES (87, 7, 67, '2025-03-06 12:10:28', 0, 'MOCK-DEVICE-7', '2025-03-06 12:10:28', '2025-03-06 12:10:28');
INSERT INTO `health_data` VALUES (88, 7, 88, '2025-03-06 12:11:27', 0, 'MOCK-DEVICE-7', '2025-03-06 12:11:27', '2025-03-06 12:11:27');
INSERT INTO `health_data` VALUES (89, 7, 87, '2025-03-06 12:12:27', 0, 'MOCK-DEVICE-7', '2025-03-06 12:12:27', '2025-03-06 12:12:27');
INSERT INTO `health_data` VALUES (90, 7, 69, '2025-03-06 12:13:27', 0, 'MOCK-DEVICE-7', '2025-03-06 12:13:27', '2025-03-06 12:13:27');
INSERT INTO `health_data` VALUES (91, 7, 69, '2025-03-06 12:13:41', 0, 'MOCK-DEVICE-7', '2025-03-06 12:13:41', '2025-03-06 12:13:41');
INSERT INTO `health_data` VALUES (92, 7, 94, '2025-03-06 12:14:46', 0, 'MOCK-DEVICE-7', '2025-03-06 12:14:46', '2025-03-06 12:14:46');
INSERT INTO `health_data` VALUES (93, 7, 100, '2025-03-06 12:15:46', 0, 'MOCK-DEVICE-7', '2025-03-06 12:15:46', '2025-03-06 12:15:46');

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息内容',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息类型：SYSTEM-系统通知，ACTIVITY-活动提醒，SERVICE-服务通知',
  `sender_id` bigint(20) NULL DEFAULT NULL COMMENT '发送者ID',
  `receiver_id` bigint(20) NULL DEFAULT NULL COMMENT '接收者ID',
  `related_id` bigint(20) NULL DEFAULT NULL COMMENT '关联ID（活动ID或服务ID）',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读',
  `create_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of messages
-- ----------------------------
INSERT INTO `messages` VALUES (2, '2', '2', 'SYSTEM', 1, 1, NULL, 1, '2025-02-08 14:32:24', '2025-02-08 14:32:28');
INSERT INTO `messages` VALUES (3, '2', '2', 'SYSTEM', 1, 2, NULL, 1, '2025-02-08 14:32:24', '2025-02-08 14:33:01');
INSERT INTO `messages` VALUES (4, '2', '2', 'SYSTEM', 1, 3, NULL, 1, '2025-02-08 14:32:24', '2025-02-08 14:32:44');
INSERT INTO `messages` VALUES (5, '2', '2', 'SYSTEM', 1, 4, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (6, '2', '2', 'SYSTEM', 1, 5, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (7, '2', '2', 'SYSTEM', 1, 6, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (8, '2', '2', 'SYSTEM', 1, 7, NULL, 1, '2025-02-08 14:32:24', '2025-02-08 16:15:23');
INSERT INTO `messages` VALUES (9, '2', '2', 'SYSTEM', 1, 13, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (10, '2', '2', 'SYSTEM', 1, 14, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (11, '2', '2', 'SYSTEM', 1, 15, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (12, '2', '2', 'SYSTEM', 1, 16, NULL, 0, '2025-02-08 14:32:24', NULL);
INSERT INTO `messages` VALUES (13, '活动通知', '您有一个活动即将开始：测试1', 'ACTIVITY', 1, 3, 5, 1, '2025-02-08 15:13:00', '2025-02-08 15:18:38');
INSERT INTO `messages` VALUES (31, '服务预约提醒', '您预约的服务null将在一小时后开始，请准时参加。', 'SERVICE', 1, 7, 18, 0, '2025-02-08 16:15:53', NULL);

-- ----------------------------
-- Table structure for services
-- ----------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '服务名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '服务描述',
  `price` decimal(10, 2) NOT NULL COMMENT '服务费用',
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '服务图片URL',
  `start_time` time(0) NOT NULL COMMENT '开始时间',
  `end_time` time(0) NOT NULL COMMENT '结束时间',
  `max_appointments` int(11) NOT NULL COMMENT '最大预约次数',
  `available_days` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '可用天数（如：1,2,3,4,5 表示周一到周五）',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '服务状态：ACTIVE-启用/INACTIVE-停用',
  `create_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`, `name`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '服务配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of services
-- ----------------------------
INSERT INTO `services` VALUES (1, '陪护服务', '提供全天候陪护服务，确保老人的日常生活得到照顾。', 100.00, '/images/care_service.png', '00:00:00', '00:00:00', 0, '', 'ACTIVE', '2025-02-04 16:38:25', '2025-02-04 16:38:25');
INSERT INTO `services` VALUES (2, '医疗检查', '定期进行健康检查，包括血压、血糖等监测。', 150.00, '/images/health_check.png', '00:00:00', '00:00:00', 0, '', 'ACTIVE', '2025-02-04 16:38:25', '2025-02-04 16:38:25');
INSERT INTO `services` VALUES (3, '外出探视', '陪同老人外出，进行短途旅行或购物。', 200.00, '/images/outing_service.png', '00:00:00', '00:00:00', 0, '', 'ACTIVE', '2025-02-04 16:38:25', '2025-02-04 16:38:25');
INSERT INTO `services` VALUES (4, '康复训练', '提供专业的康复训练，帮助老人恢复身体机能。', 120.00, '/images/recovery_training.png', '00:00:00', '00:00:00', 0, '', 'ACTIVE', '2025-02-04 16:38:25', '2025-02-04 16:38:25');
INSERT INTO `services` VALUES (13, 'ceshi', '123', 123.00, 'https://tials1.oss-cn-beijing.aliyuncs.com/services/1bf3cb24-f152-4185-9430-05955401df6d.png', '00:00:00', '00:00:00', 0, '', 'ACTIVE', '2025-02-04 21:08:42', '2025-02-04 21:08:42');
INSERT INTO `services` VALUES (17, 'ceshi1', '1', 1.00, 'https://tials1.oss-cn-beijing.aliyuncs.com/services/9bb2ae63-887f-4bb7-80ea-aec31eb439b1.png', '00:00:00', '01:00:00', 2, '1,5', 'ACTIVE', '2025-02-04 22:38:17', '2025-02-04 22:38:17');
INSERT INTO `services` VALUES (18, '测试定时任务', '1', 1.00, 'https://tials1.oss-cn-beijing.aliyuncs.com/services/26a80929-e321-401d-9e86-a286e3e1bbd7.png', '00:00:00', '23:59:00', 100, '6', 'ACTIVE', '2025-02-08 15:33:56', '2025-02-08 15:33:56');

-- ----------------------------
-- Table structure for staff_elderly
-- ----------------------------
DROP TABLE IF EXISTS `staff_elderly`;
CREATE TABLE `staff_elderly`  (
  `staff_id` int(10) NOT NULL COMMENT '添加老人时的护工登录id',
  `elderly_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '绑定老人身份证id',
  PRIMARY KEY (`staff_id`, `elderly_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of staff_elderly
-- ----------------------------
INSERT INTO `staff_elderly` VALUES (2, '371525200212291715');
INSERT INTO `staff_elderly` VALUES (2, '522631198510180054');
INSERT INTO `staff_elderly` VALUES (2, '522631198510180055');
INSERT INTO `staff_elderly` VALUES (2, '522631198510180056');
INSERT INTO `staff_elderly` VALUES (15, '371525200112191715');
INSERT INTO `staff_elderly` VALUES (15, '522631198510180057');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '手机号',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色(ADMIN/STAFF/ELDERLY/FAMILY)\r\nADMIN：超级管理员\r\nFAMILY：家属角色\r\nSTAFF：护工角色\r\nELDERLY：老人角色',
  `wx_openid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信openid',
  `created_at` datetime(0) NOT NULL COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`, `phone`) USING BTREE,
  UNIQUE INDEX `phone`(`phone`) USING BTREE,
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '1234567', '管理员', 'ADMIN', NULL, '2025-01-18 23:20:45', '2025-01-18 23:20:45');
INSERT INTO `users` VALUES (2, 'staff', '123456', '护工', 'STAFF', NULL, '2025-01-18 23:20:45', '2025-01-18 23:20:45');
INSERT INTO `users` VALUES (3, 'elderly', '123456', '老人', 'ELDERLY', NULL, '2025-01-18 23:20:45', '2025-01-18 23:20:45');
INSERT INTO `users` VALUES (4, 'family', '123456', '家属', 'FAMILY', NULL, '2025-01-19 23:15:30', '2025-01-19 23:15:35');
INSERT INTO `users` VALUES (5, '13336356002', '123456', 'ceshi', 'FAMILY', NULL, '2025-01-23 13:44:01', '2025-01-23 13:44:01');
INSERT INTO `users` VALUES (6, '371525200212291715', '123456', '1', 'ELDERLY', NULL, '2025-01-24 14:56:32', '2025-01-24 14:56:32');
INSERT INTO `users` VALUES (7, '13336356001', '123456', '2', 'ELDERLY', NULL, '2025-01-24 20:14:06', '2025-01-24 20:14:06');
INSERT INTO `users` VALUES (13, '522631198510180055', '123456', '3', 'ELDERLY', NULL, '2025-01-24 22:46:15', '2025-01-24 22:46:15');
INSERT INTO `users` VALUES (14, '522631198510180056', '123456', '4', 'ELDERLY', NULL, '2025-01-24 22:51:52', '2025-01-24 22:51:52');
INSERT INTO `users` VALUES (15, 'staff2', '123456', '护工2', 'STAFF', NULL, '2025-01-18 23:20:45', '2025-01-18 23:20:45');
INSERT INTO `users` VALUES (16, '522631198510180057', '123456', 'd', 'ELDERLY', NULL, '2025-02-03 15:22:06', '2025-02-03 15:22:06');
INSERT INTO `users` VALUES (17, '16666668888', '123456', '张三', 'ELDERLY', NULL, '2025-03-06 12:04:11', '2025-03-06 12:04:11');

SET FOREIGN_KEY_CHECKS = 1;
