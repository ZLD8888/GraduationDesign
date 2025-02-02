package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.dto.FamilyBindDto;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.mapper.FamilyMapper;
import com.zzxy.elderlycare.service.FamilyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class FamilyServiceImpl implements FamilyService {
    @Autowired
    private FamilyMapper familyMapper;

    /**
     * @param userID  用户id
     * @description 获取绑定的老人信息
     * @return 绑定的老人信息
     */
    @Override
    public List<Elderly> getBindElderlyInfo(Integer userID) {
        List<Elderly> dbbindElderlyInfo = familyMapper.getBindElderlyInfo(userID);
        return dbbindElderlyInfo;
    }

    /**
     * @param familyBindDto 绑定信息
     * @return 是否存在该老人
     * @description 判断老人是否存在
     */
    @Override
    public boolean getElderInfoByIdCard(FamilyBindDto familyBindDto) {
        Boolean elderInfoByIdCard = familyMapper.getElderInfoByIdCard(familyBindDto);
        if (elderInfoByIdCard == null) {
            return false;
        }else {
            return true;
        }
    }

    /**
     * @param familyBindDto  绑定信息
     * @description 判断老人是否已经绑定
     * @return 是否已经绑定
     */
    @Override
    public boolean getElderByIdCard(FamilyBindDto familyBindDto) {
        Boolean elderByIdCard = familyMapper.getElderByIdCard(familyBindDto);
        if (elderByIdCard == null) {
            return false;
        }
        return true;
    }

    /**
     * @param familyBindDto 绑定信息
     * @description 绑定老人
     */
    @Override
    public void bindElderly(FamilyBindDto familyBindDto) {
        familyMapper.bindElderly(familyBindDto);
    }

    @Override
    public void unbindElderly(FamilyBindDto familyBindDto) {
        familyMapper.unbindElderly(familyBindDto);
    }
}
