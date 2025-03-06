package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.config.HuaweiHealthConfig;
import com.zzxy.elderlycare.config.RabbitMQConfig;
import com.zzxy.elderlycare.entity.HealthData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;

@Slf4j
@Service
public class HuaweiHealthService {
    /*
     * 注意：由于暂时无法获取华为健康API密钥，该服务暂时停用
     * 当前使用 MockHealthDataService 生成模拟数据
     * 等获取到华为健康API密钥后，可以取消注释下面的代码并停用 MockHealthDataService
     */

    /*
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${health.data.abnormal.heart-rate.min}")
    private int minHeartRate;

    @Value("${health.data.abnormal.heart-rate.max}")
    private int maxHeartRate;

    @Scheduled(fixedRateString = "${health.data.pull-interval}")
    public void pullHealthData() {
        try {
            // 模拟数据
            HealthData mockData = new HealthData();
            mockData.setHeartRate(generateRandomHeartRate());
            mockData.setUserId(1L);
            mockData.setDeviceId("HUAWEI-WATCH-GT5");
            mockData.setTimestamp(LocalDateTime.now());
            mockData.setIsAbnormal(isAbnormalHeartRate(mockData.getHeartRate()));

            // 发送到消息队列
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.HEALTH_EXCHANGE,
                RabbitMQConfig.HEALTH_ROUTING_KEY,
                mockData
            );

            // 如果是异常数据,发送告警
            if (mockData.getIsAbnormal()) {
                rabbitTemplate.convertAndSend(
                    RabbitMQConfig.HEALTH_EXCHANGE,
                    RabbitMQConfig.ALERT_ROUTING_KEY,
                    createAlertMessage(mockData)
                );
            }
            
            log.info("成功拉取健康数据: {}", mockData);
        } catch (Exception e) {
            log.error("拉取健康数据失败", e);
        }
    }

    private int generateRandomHeartRate() {
        return (int) (Math.random() * 60 + 50); // 生成50-110之间的随机心率
    }

    private boolean isAbnormalHeartRate(int heartRate) {
        return heartRate < minHeartRate || heartRate > maxHeartRate;
    }

    private String createAlertMessage(HealthData data) {
        return String.format("检测到异常心率: %d次/分", data.getHeartRate());
    }
    */
} 