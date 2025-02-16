package com.zzxy.elderlycare.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "huawei.health")
public class HuaweiHealthConfig {
    private String appId;
    private String appSecret;
    private String callbackUrl;
    private List<String> dataTypes;
    private Integer pullInterval;
} 