package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.controller.AuthController;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.mapper.ElderlyMapper;
import com.zzxy.elderlycare.service.ElderlyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.beans.Transient;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ElderlyServiceImpl implements ElderlyService {
    @Autowired
    private ElderlyMapper elderlyMapper;
    @Override
    public List<Elderly> allelederlyInfo() {
        List<Elderly> dbelderlies = elderlyMapper.allelederlyInfo();
        return dbelderlies;
    }

    @Override
    public void oldManregister(Elderly elderly) {
        log.info("老人注册:{}",elderly);
        elderly.setCreatedAt(LocalDateTime.now());
        elderly.setUpdatedAt(LocalDateTime.now());
        elderlyMapper.oldManregister(elderly);
    }

    @Transactional
    @Override
    public void addElderly(Elderly elderly) {
        elderly.setCreatedAt(LocalDateTime.now());
        elderly.setUpdatedAt(LocalDateTime.now());
        elderlyMapper.addElderly(elderly);
        log.info("添加老人成功:{}",elderly);
        oldManregister(elderly);
        log.info("注册成功");
        log.info("查询插入老人信息获取老人ID");
        Elderly dbelderlyByIdCard = elderlyMapper.getElderlyByIdCard(elderly.getIdCard());
        log.info("插入老人成功:{}",dbelderlyByIdCard);
        log.info("插入老人和护工id");
        elderlyMapper.addElderlyAndUserId(dbelderlyByIdCard.getCaregiverId() , dbelderlyByIdCard.getId());
    }

    @Override
    public Elderly getElderlyById(Integer id) {
        log.info("根据id查询老人信息:{}",id);
        Elderly dbelderlyById = elderlyMapper.getElderlyById(id);
        return dbelderlyById;
    }

    @Override
    public void deleteElderlyById(Integer id) {
        log.info("删除老人账号");
        Elderly dbelderlyInfo = elderlyMapper.getElderlyById(id);
        String IdCard = dbelderlyInfo.getIdCard();
        elderlyMapper.deleteelderlyUser(IdCard);
        log.info("删除老人信息");
        elderlyMapper.deleteElderlyById(id);
        log.info("删除老人成功");
        log.info("删除老人和护工id");
        elderlyMapper.deleteElderlyAndUserId(id);

    }

    @Override
    public void updateElderlyInfo(Integer id, Elderly elderly) {
        log.info("更新老人信息:{}",elderly);
        elderly.setUpdatedAt(LocalDateTime.now());
        elderlyMapper.updateElderlyInfo(id,elderly);
    }

    @Override
    public void updateUserPhone(String oldIdCard, String newIdCard) {
        elderlyMapper.updateUserPhone(oldIdCard,newIdCard);
    }

    @Override
    public void updateStaffId(Integer oldCaregiverId, Integer newCaregiverId) {
        elderlyMapper.updateStaffId(oldCaregiverId,newCaregiverId);
    }


}
