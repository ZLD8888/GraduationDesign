package com.zzxy.elderlycare.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentUserDto {
    private String appointmentNo;
    private Integer userId;
    private Integer serviceId;
    private Integer elderlyId;
    private String date;
    private String time;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
