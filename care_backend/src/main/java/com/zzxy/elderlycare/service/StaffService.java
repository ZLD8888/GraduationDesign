package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.Elderly;

import java.util.List;

public interface StaffService {
    List<Elderly> getElderlyInfo(Integer stffId);
}
