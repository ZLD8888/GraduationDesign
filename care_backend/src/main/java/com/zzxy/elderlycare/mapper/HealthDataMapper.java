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

    @Select("SELECT * FROM elderly_info")
    List<Elderly> getAllElderlyList();

    @Select("SELECT e.* FROM elderly_info e " +
            "INNER JOIN staff_elderly ser ON e.id = ser.elderly_id " +
            "WHERE ser.staff_id = #{staffId}")
    List<Elderly> getElderlyListByStaffId(@Param("staffId") Long staffId);

    @Select("SELECT e.* FROM elderly_info e " +
            "INNER JOIN family_elderly fer ON e.id = fer.elderly_id " +
            "WHERE fer.family_userid = #{familyId}")
    List<Elderly> getElderlyListByFamilyId(@Param("familyId") Long familyId);

    @Select("SELECT * FROM elderly_info WHERE id = #{elderlyId}")
    Elderly getElderlyById(@Param("elderlyId") Long elderlyId);
}