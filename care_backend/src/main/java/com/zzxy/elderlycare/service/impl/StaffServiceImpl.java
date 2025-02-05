package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.mapper.StaffMapper;
import com.zzxy.elderlycare.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffServiceImpl implements StaffService {
    @Autowired
    private StaffMapper staffMapper;
    @Override
    public List<Elderly> getElderlyInfo(Integer stffId) {
        List<Elderly> elderly = staffMapper.getElderlyInfo(stffId);
        return elderly;
    }
}
