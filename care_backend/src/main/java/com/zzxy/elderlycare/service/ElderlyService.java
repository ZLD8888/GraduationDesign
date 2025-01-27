package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.Elderly;

import java.util.List;

public interface ElderlyService {
    List<Elderly> allelederlyInfo();

    //老人注册
    void oldManregister(Elderly elderly);
    void addElderly(Elderly elderly);

    Elderly getElderlyById(Integer id);

    void deleteElderlyById(Integer id);

    void updateElderlyInfo(Integer id, Elderly elderly);

    void updateUserPhone(String oldIdCard, String newIdCard);

    void updateStaffId(Integer oldCaregiverId, Integer newCaregiverId);
}
