package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Appointments;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface AppointmentMapper {
    @Update("update appointments_user set status=#{appointments1.status},update_time=#{appointments1.updateTime} where appointment_no=#{id}")
    void updateAppointmentStatus(String id, Appointments appointments1);
}
