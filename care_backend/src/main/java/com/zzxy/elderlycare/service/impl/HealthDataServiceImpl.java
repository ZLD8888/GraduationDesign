package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.HealthData;
import com.zzxy.elderlycare.event.HealthDataEvent;
import com.zzxy.elderlycare.mapper.HealthDataMapper;
import com.zzxy.elderlycare.mapper.ElderlyMapper;
import com.zzxy.elderlycare.service.HealthDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
public class HealthDataServiceImpl implements HealthDataService {

    @Autowired
    private HealthDataMapper healthDataMapper;

    @Autowired
    private ElderlyMapper elderlyMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public void saveHealthData(HealthData data) {
        data.setCreateTime(LocalDateTime.now());
        data.setUpdateTime(LocalDateTime.now());
        data.setIsAbnormal(isAbnormalHeartRate(data.getHeartRate()));
        healthDataMapper.insert(data);
    }

    @Override
    public List<HealthData> getHistoryData(Long userId, String range) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = range.equals("day") ? 
            endTime.minusHours(24) : endTime.minusDays(7);
        
        return healthDataMapper.getHistoryData(userId, startTime, endTime);
    }

    @Override
    public List<HealthData> getRecentAbnormalData(Long userId) {
        return healthDataMapper.getRecentAbnormalData(userId);
    }

    @Override
    public void handleRealTimeData(HealthData data) {
        // 保存数据到数据库
        healthDataMapper.insert(data);

        // 构造消息
        Map<String, Object> message = new HashMap<>();
        message.put("heartRate", data.getHeartRate());
        message.put("timestamp", data.getTimestamp());
        message.put("isAbnormal", data.getIsAbnormal());
        message.put("type", "REAL_TIME_DATA");

        // 发布事件
        eventPublisher.publishEvent(new HealthDataEvent(this, data.getUserId().toString(), message));
    }

    @Override
    public List<Elderly> getAllElderlyList() {
        return healthDataMapper.getAllElderlyList();
    }

    @Override
    public List<Elderly> getElderlyListByStaffId(Long staffId) {
        return healthDataMapper.getElderlyListByStaffId(staffId);
    }

    @Override
    public List<Elderly> getElderlyListByFamilyId(Long familyId) {
        return healthDataMapper.getElderlyListByFamilyId(familyId);
    }

    @Override
    public Elderly getElderlyById(Long elderlyId) {
        return healthDataMapper.getElderlyById(elderlyId);
    }

    @Override
    public boolean checkDeviceBind(Long elderlyId) {
        return healthDataMapper.checkDeviceBind(elderlyId) != null;
    }

    @Override
    public void bindDevice(Long elderlyId) {
        // 获取当前最大设备ID
        Integer maxDeviceId = healthDataMapper.getMaxDeviceId();
        int newDeviceId = (maxDeviceId == null ? 0 : maxDeviceId) + 1;
        
        // 绑定新设备
        healthDataMapper.bindDevice(elderlyId, String.valueOf(newDeviceId));
    }

    @Override
    public List<Elderly> getAllElderlyBindList() {
        return healthDataMapper.getAllElderlyBindList();
    }

    @Override
    public HealthData getLatestHealthData(Long elderlyId) {
        HealthData latestData = healthDataMapper.findLatestByElderlyId(elderlyId);
        if (latestData != null) {
            // 构造消息
            Map<String, Object> message = new HashMap<>();
            message.put("heartRate", latestData.getHeartRate());
            message.put("timestamp", latestData.getTimestamp());
            message.put("isAbnormal", latestData.getIsAbnormal());
            message.put("type", "LATEST_DATA");

            // 发布事件
            eventPublisher.publishEvent(new HealthDataEvent(this, elderlyId.toString(), message));
        }
        return latestData;
    }

    private boolean isAbnormalHeartRate(Integer heartRate) {
        return heartRate < 60 || heartRate > 100;
    }

    private void checkAndSendAlert(HealthData healthData) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("type", "ALERT");
        alert.put("message", String.format(
            "异常心率警报：%d 次/分钟", 
            healthData.getHeartRate()
        ));
        alert.put("timestamp", healthData.getCreateTime());
        alert.put("heartRate", healthData.getHeartRate());
        
        eventPublisher.publishEvent(new HealthDataEvent(this, healthData.getUserId().toString(), alert));
    }
} 