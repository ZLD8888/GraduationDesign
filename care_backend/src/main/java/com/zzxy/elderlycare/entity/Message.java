package com.zzxy.elderlycare.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Message {
        private Long id;
        private String title;
        private String content;
        private String type;  // SYSTEM, ACTIVITY, SERVICE
        private Long senderId;
        private Long receiverId;
        private Long relatedId;  // 关联的活动ID或服务ID
        private Boolean isRead;
        private LocalDateTime createTime;
        private LocalDateTime updateTime;
}
