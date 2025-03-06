package com.zzxy.elderlycare.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class HealthDataEvent extends ApplicationEvent {
    private final String elderlyId;
    private final Object data;

    public HealthDataEvent(Object source, String elderlyId, Object data) {
        super(source);
        this.elderlyId = elderlyId;
        this.data = data;
    }
} 