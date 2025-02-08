package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Appointments;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper
public interface AppointmentMapper {
    @Update("update appointments_user set status=#{appointments1.status},update_time=#{appointments1.updateTime} where appointment_no=#{id}")
    void updateAppointmentStatus(String id, Appointments appointments1);

    @Select("select * from appointments_user where str_to_date(concat(data,' ',time),'%Y-%m-%d %H:%i') >= now() - interval 1 hour and status = 'CONFIRMED' and str_to_date(concat(data,' ',time),'%Y-%m-%d %H:%i') <= now() + interval 1 hour")
    List<Appointments> selectUpcomingAppointments();


}
