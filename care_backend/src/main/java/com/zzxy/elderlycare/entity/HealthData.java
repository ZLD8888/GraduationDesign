package com.zzxy.elderlycare.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class HealthData implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private Long userId;
    private Integer heartRate;
    private LocalDateTime timestamp;
    private Boolean isAbnormal;
    private String deviceId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
} 