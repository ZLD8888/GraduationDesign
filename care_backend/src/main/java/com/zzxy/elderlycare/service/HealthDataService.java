package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.HealthData;

import java.util.Arrays;
import java.util.List;

public interface HealthDataService {
    void saveHealthData(HealthData data);
    List<HealthData> getHistoryData(Long userId, String range);
    List<HealthData> getRecentAbnormalData(Long userId);
    void handleRealTimeData(HealthData data);

    List<Elderly> getAllElderlyList();
    List<Elderly> getElderlyListByStaffId(Long staffId);
    List<Elderly> getElderlyListByFamilyId(Long familyId);
    Elderly getElderlyById(Long elderlyId);
    boolean checkDeviceBind(Long elderlyId);
    void bindDevice(Long elderlyId);

    List<Elderly> getAllElderlyBindList();

    HealthData getLatestHealthData(Long elderlyId);
}