package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.FamilyBindDto;
import com.zzxy.elderlycare.entity.Elderly;

import java.util.List;

public interface FamilyService {
    boolean getElderInfoByIdCard(FamilyBindDto familyBindDto);

    void bindElderly(FamilyBindDto familyBindDto);

    List<Elderly> getBindElderlyInfo(Integer userID);

    boolean getElderByIdCard(FamilyBindDto familyBindDto);

    void unbindElderly(FamilyBindDto familyBindDto);
}
