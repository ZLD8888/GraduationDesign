package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.mapper.ElderlyMapper;
import com.zzxy.elderlycare.service.ElderlyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
