package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.dto.AppointmentUserDto;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Services;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ServiceMapper {
    @Select("select * from services")
    List<Services> selectAllList();

    @Select("""
            SELECT au.appointment_no AS appointmentNo,s.name AS serviceName,u.name AS elderlyName,u.name AS userName,s.price AS price,au.data AS data,au.time AS time,au.status AS status,au.create_time AS createTime
            FROM
                appointments_user au
            INNER JOIN services s         ON au.service_id = s.id
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

    @Select("select au.appointment_no AS appointmentNo,s.name AS serviceName,u.name AS elderlyName,u.name AS userName,s.price AS price,au.data AS data, au.time AS time,au.status AS status,au.create_time AS createTime,s.image_url AS imageUrl from appointments_user au inner join services s on au.service_id = s.id inner join users u on au.user_id = u.id  where au.elderly_id = #{userID} or au.user_id = #{userID}")
    List<Appointments> getElderlyAppointments(Integer userID);

    @Update("update appointments_user set status = 'CANCELLED' where appointment_no = #{appointmentNo}")
    void cancelAppointment(String appointmentNo);

    @Select("select * from appointments_user where appointment_no = #{appointmentNo}")
    Appointments getAppointmentByNo(String appointmentNo);

    @Select("select * from elderly_info where phone in (select phone from users where id = #{userId})")
    Elderly getElderlyInfoByReturnUserID(Integer userId);

    @Select("""
            select au.appointment_no as appointmentNo,s.name as serviceName,s.price as price,e.name as elderlyName,u.name as userName,au.data as data,au.time as time,au.create_time as createTime,au.status as status,s.image_url as imageUrl from appointments_user au
                     inner join users u on au.user_id = u.id
                     inner join services s on au.service_id = s.id
                     inner join elderly_info e on au.elderly_id = e.id
                     where au.elderly_id in (select id from elderly_info where id_card in (select elderly_id from staff_elderly where staff_id = #{staffId}))""")
    List<Appointments> getStaffAppointments(Integer staffId);

    @Select("select name as name, id as id from elderly_info where id_card in (select elderly_id from family_elderly where family_userid = #{familyId})")
    List<Elderly> getElderlyNameByFamilyId(Integer familyId);

    @Select("""
            select au.appointment_no as appointmentNo,s.name as serviceName,s.price as price,e.name as elderlyName,u.name as userName,au.data as data,au.time as time,au.create_time as createTime,au.status as status,s.image_url as imageUrl from appointments_user au
                     inner join users u on au.user_id = u.id
                     inner join services s on au.service_id = s.id
                     inner join elderly_info e on au.elderly_id = e.id
                     where au.elderly_id in (select id from elderly_info where id_card in (select elderly_id from family_elderly where family_userid = #{familyId}))""")
    List<Appointments> getFamilyAppointments(Integer familyId);
}
