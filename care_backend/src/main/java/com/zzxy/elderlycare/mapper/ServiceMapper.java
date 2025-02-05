package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.dto.AppointmentUserDto;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.entity.Services;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ServiceMapper {
    @Select("select * from services")
    List<Services> selectAllList();

    @Select("""
            SELECT au.appointment_no AS appointmentNo,s.name AS serviceName,e.name AS elderlyName,u.name AS userName,s.name AS price,au.data AS appointmentTime, au.status AS status,au.create_time AS createTime
            FROM
                appointments_user au
            INNER JOIN services s         ON au.service_id = s.id
            INNER JOIN elderly_info e    ON au.elderly_id = e.id
            INNER JOIN users u            ON au.user_id = u.id;""")
    List<Appointments> selectAllAppointment();

    @Insert("insert into services " +
            "(name, description, price, image_url, start_time, end_time, max_appointments, available_days, status, create_time, update_time) " +
            "values " +
            "(#{name}, #{description}, #{price}, #{imageUrl}, #{startTime}, #{endTime}, #{maxAppointments}, #{availableDays}, #{status}, #{createTime}, #{updateTime})")
    void addService(Services service);
    @Delete("delete from services where id = #{id}")
    void deleteService(Integer id);
    @Select("select * from services where id = #{id}")
    Services getServiceInfoById(Integer id);
    @Update("update services set name = #{name}, description = #{description}, price = #{price}, image_url = #{imageUrl},update_time = #{updateTime} where id = #{id}")
    void updateService(Services service);
    @Select("select start_time,end_time,max_appointments,available_days from" +
            " services " +
            "where id = #{serviceID}")
    List<Services> getTimeSlots(Integer serviceID);
    @Select("select count(*) from appointments_user where service_id = #{serviceID} and data = #{date}")
    int getServiceAppointmentCount(Integer serviceID, String date);

    @Insert("insert into appointments_user " +
            "(appointment_no, user_id, service_id, elderly_id, data, time, status, create_time, update_time) " +
            "values " +
            "(#{appointmentNo}, #{userId}, #{serviceId}, #{elderlyId}, #{date}, #{time}, 'CONFIRMED', #{createTime}, #{updateTime})")
    void addAppointment(AppointmentUserDto appointmentUserDto);

    @Select("select au.appointment_no AS appointmentNo,s.name AS serviceName,e.name AS elderlyName,u.name AS userName,s.price AS price,au.data AS appointmentTime, au.status AS status,au.create_time AS createTime from appointments_user au inner join services s on au.service_id = s.id inner join users u on au.user_id = u.id inner join elderly_info e on au.elderly_id = e.id where au.elderly_id = #{userID} or au.user_id = #{userID}")
    List<Appointments> getElderlyAppointments(Integer userID);
}
