package com.zzxy.elderlycare.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Appointments {
    private String  appointmentNo;
    private Integer serviceId;
    private String serviceName;
    private String elderlyName;
    private Integer userId;
    private String userName;
    private Double price;
    private String elderlyIdCard;
    private String elderlyPhone;
    private LocalDateTime appointmentTime;
    private Integer timeSlotId;
    private String status;
    private String note;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer creatorId;
    private String creatorType;
    private String imageUrl;
    private String data;
    private String time;

}
