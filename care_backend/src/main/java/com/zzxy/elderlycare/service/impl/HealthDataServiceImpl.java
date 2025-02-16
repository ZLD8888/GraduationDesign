package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.HealthData;
import com.zzxy.elderlycare.mapper.HealthDataMapper;
import com.zzxy.elderlycare.service.HealthDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class HealthDataServiceImpl implements HealthDataService {

    @Autowired
    private HealthDataMapper healthDataMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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
        // 保存数据
        saveHealthData(data);
        
        // 推送数据给前端
        messagingTemplate.convertAndSend(
            "/topic/health/" + data.getUserId(), 
            data
        );
        
        // 如果是异常数据,额外推送警报
        if (data.getIsAbnormal()) {
            messagingTemplate.convertAndSend(
                "/topic/alert/" + data.getUserId(),
                createAlertMessage(data)
            );
        }
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

    private boolean isAbnormalHeartRate(Integer heartRate) {
        return heartRate < 60 || heartRate > 100;
    }

    private String createAlertMessage(HealthData data) {
        return String.format("检测到异常心率: %d次/分", data.getHeartRate());
    }
} 