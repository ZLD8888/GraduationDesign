package com.zzxy.elderlycare.entity;

import lombok.Data;

import javax.swing.*;
import java.time.LocalDateTime;

@Data
public class Elderly {
    private Long id; // 主键
    private String name; // 姓名
    private String gender; // 性别
    private String birthDate; // 出生日期
    private String idCard; // 身份证号
    private String phone; // 手机号
    private String bedNumber; // 床位号
    private String checkInDate; // 入住日期
    private Integer caregiverId; // 护工ID
    private String healthCondition; // 健康状况
    private String dietaryRestrictions; // 饮食限制
    private String emergencyContactName; // 紧急联系人姓名
    private String emergencyContactPhone; // 紧急联系人电话
    private LocalDateTime createdAt; // 创建时间
    private LocalDateTime updatedAt; // 更新时间
    private Long elderlyUsersId; // 老人用户ID
}
