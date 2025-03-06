package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.HealthData;
import org.apache.ibatis.annotations.*;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface HealthDataMapper {

    @Insert("INSERT INTO health_data(user_id, heart_rate, timestamp, is_abnormal, device_id, create_time, update_time) " +
            "VALUES(#{userId}, #{heartRate}, #{timestamp}, #{isAbnormal}, #{deviceId}, #{createTime}, #{updateTime})")
    void insert(HealthData healthData);

    @Select("SELECT * FROM health_data WHERE user_id = #{userId} " +
            "AND timestamp BETWEEN #{startTime} AND #{endTime} " +
            "ORDER BY timestamp DESC")
    List<HealthData> getHistoryData(@Param("userId") Long userId, 
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM health_data WHERE user_id = #{userId} " +
            "AND is_abnormal = true " +
            "ORDER BY timestamp DESC LIMIT 5")
    List<HealthData> getRecentAbnormalData(@Param("userId") Long userId);

    @Select("""
            SELECT e.*,u.id AS elderlyUsersId FROM elderly_info e
            inner join users u on u.phone = e.phone or u.phone = e.id_card""")
    List<Elderly> getAllElderlyList();

    @Select("""
            SELECT e.*,u.id AS elderlyUsersId FROM elderly_info e
            INNER JOIN  staff_elderly se on se.elderly_id = e.id_card
            INNER JOIN users u on u.phone = e.phone or u.phone = e.id_card
            WHERE se.staff_id = #{staffId}""")
    List<Elderly> getElderlyListByStaffId(@Param("staffId") Long staffId);

    @Select("""
            SELECT e.*,u.id AS elderlyUsersId FROM elderly_info e
            INNER JOIN  family_elderly fe on fe.elderly_id = e.id_card
            INNER JOIN users u on u.phone = e.phone or u.phone = e.id_card
            WHERE fe.family_userid = #{familyId}""")
    List<Elderly> getElderlyListByFamilyId(@Param("familyId") Long familyId);

    @Select("SELECT * FROM users WHERE id = #{elderlyId}")
    Elderly getElderlyById(@Param("elderlyId") Long elderlyId);

    @Select("SELECT device_id FROM elderly_device WHERE elderly_users_id = #{elderlyId} AND status = 1 LIMIT 1")
    String checkDeviceBind(@Param("elderlyId") Long elderlyId);

    @Select("SELECT CAST(device_id AS SIGNED) as device_id FROM elderly_device ORDER BY CAST(device_id AS SIGNED) DESC LIMIT 1")
    Integer getMaxDeviceId();

    @Insert("INSERT INTO elderly_device(elderly_users_id, device_id, status, create_time, update_time) " +
            "VALUES(#{elderlyId}, #{deviceId}, 1, NOW(), NOW())")
    void bindDevice(@Param("elderlyId") Long elderlyId, @Param("deviceId") String deviceId);
    @Select("SELECT * FROM elderly_device")
    List<Elderly> getAllElderlyBindList();

    @Select("SELECT * FROM health_data WHERE user_id = #{elderlyId} ORDER BY timestamp DESC LIMIT 1")
    HealthData findLatestByElderlyId(Long elderlyId);
}