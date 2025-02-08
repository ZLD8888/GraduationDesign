package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.Appointments;

import java.util.List;

public interface AppointmentService {
    void updateAppointmentStatus(String id, Appointments appointments1);

    /**
     * @return 获取在一个小时以内要开始的预约
     */
    List<Appointments> getUpcomingAppointments();
}
