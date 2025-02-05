package com.zzxy.elderlycare.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class Services {
    private Integer id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxAppointments;
    private String availableDays;
}
