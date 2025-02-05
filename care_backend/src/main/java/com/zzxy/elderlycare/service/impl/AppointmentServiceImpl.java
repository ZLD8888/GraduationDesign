package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.mapper.AppointmentMapper;
import com.zzxy.elderlycare.service.AppointmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
}
