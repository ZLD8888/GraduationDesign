package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.mapper.AppointmentMapper;
import com.zzxy.elderlycare.service.AppointmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class AppointmentServiceImpl implements AppointmentService {
    @Autowired
    private AppointmentMapper appointmentMapper;

    @Override
    public void updateAppointmentStatus(String id, Appointments appointments1) {
        appointments1.setUpdateTime(LocalDateTime.now());
        appointmentMapper.updateAppointmentStatus(id, appointments1);
    }

    /**
     * @return 获取在一个小时以内要开始的预约
     */
    @Override
    public List<Appointments> getUpcomingAppointments() {
        // 获取当前时间加一小时
        LocalDateTime oneHourLater = LocalDateTime.now().plusHours(1);
        // 创建查询时间点
        LocalDateTime queryTime = oneHourLater;
        
        log.info("当前时间: {}", LocalDateTime.now());
        log.info("查询时间点: {}", queryTime);
        
        List<Appointments> appointments = appointmentMapper.selectUpcomingAppointments();
        log.info("查询到 {} 个即将开始的预约", appointments.size());
        
        return appointments;
    }

}
