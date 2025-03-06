package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.config.RabbitMQConfig;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.HealthData;
import com.zzxy.elderlycare.config.MyWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
@EnableScheduling
public class MockHealthDataService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private HealthDataService healthDataService;

    @Autowired
    private MyWebSocketHandler webSocketHandler;

    @Value("${health.data.abnormal.heart-rate.min:60}")
    private int minHeartRate;

    @Value("${health.data.abnormal.heart-rate.max:100}")
    private int maxHeartRate;

    private final Random random = new Random();
    private boolean rabbitMQAvailable = true;

    @Scheduled(fixedRateString = "${health.data.pull-interval:5000}")
    public void generateMockData() {
        List<Elderly> elderlyList = healthDataService.getAllElderlyBindList();
        if (elderlyList.isEmpty()) {
            log.info("没有找到已绑定的设备");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        Random random = new Random();

        for (Elderly elderly : elderlyList) {
            // 生成65-100之间的随机心率
            int heartRate = 65 + random.nextInt(36);
            boolean isAbnormal = heartRate < 60 || heartRate > 100;

            HealthData healthData = new HealthData();
            healthData.setUserId(elderly.getElderlyUsersId());
            healthData.setHeartRate(heartRate);
            healthData.setTimestamp(now);
            healthData.setIsAbnormal(isAbnormal);
            healthData.setDeviceId("MOCK-DEVICE-" + elderly.getElderlyUsersId());
            healthData.setCreateTime(now);
            healthData.setUpdateTime(now);

            // 保存到数据库
            healthDataService.saveHealthData(healthData);

            // 构造WebSocket消息
            Map<String, Object> message = new HashMap<>();
            message.put("heartRate", heartRate);
            message.put("timestamp", now);
            message.put("isAbnormal", isAbnormal);

            // 通过WebSocket发送实时数据
            webSocketHandler.sendMessageToUser(String.valueOf(elderly.getElderlyUsersId()), message);

            log.info("为老人ID: {} 生成模拟数据: {}", elderly.getElderlyUsersId(), healthData);

            // 如果心率异常，创建告警信息
            if (isAbnormal) {
                createAlert(elderly.getElderlyUsersId(), heartRate);
            }
        }
    }

    private HealthData generateMockHealthData(Long elderlyId) {
        HealthData mockData = new HealthData();
        mockData.setUserId(elderlyId);
        mockData.setDeviceId("MOCK-DEVICE-" + elderlyId);
        mockData.setTimestamp(LocalDateTime.now());
        mockData.setCreateTime(LocalDateTime.now());
        mockData.setUpdateTime(LocalDateTime.now());
        
        // 生成模拟心率数据
        int heartRate = generateMockHeartRate();
        mockData.setHeartRate(heartRate);
        mockData.setIsAbnormal(isAbnormalHeartRate(heartRate));
        
        return mockData;
    }

    private int generateMockHeartRate() {
        // 基础心率范围：60-100
        int baseHeartRate = 60 + random.nextInt(41);
        
        // 添加一些随机波动（-5到+5）
        int variation = random.nextInt(11) - 5;
        
        // 有10%的概率生成异常数据
        if (random.nextDouble() < 0.1) {
            // 生成异常心率（40-59或101-120）
            return random.nextBoolean() ? 
                   40 + random.nextInt(20) :  // 低心率
                   101 + random.nextInt(20);  // 高心率
        }
        
        return Math.max(40, Math.min(120, baseHeartRate + variation));
    }

    private boolean isAbnormalHeartRate(int heartRate) {
        return heartRate < minHeartRate || heartRate > maxHeartRate;
    }

    private String createAlertMessage(Long elderlyId, int heartRate) {
        return String.format("检测到异常心率: %d次/分", heartRate);
    }

    private void createAlert(Long elderlyId, int heartRate) {
        String alertMessage = createAlertMessage(elderlyId, heartRate);
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.HEALTH_EXCHANGE,
                RabbitMQConfig.ALERT_ROUTING_KEY,
                alertMessage
            );
        } catch (AmqpException e) {
            log.error("RabbitMQ发送告警失败", e);
        }
    }
} 