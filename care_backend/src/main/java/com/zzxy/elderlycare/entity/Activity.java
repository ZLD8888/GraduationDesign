package com.zzxy.elderlycare.entity;

import lombok.*;

import javax.persistence.Column;
import java.time.LocalDateTime;
@Data
public class Activity {
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String activityStatus;
    private Integer organizerId;
    private String organizerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
