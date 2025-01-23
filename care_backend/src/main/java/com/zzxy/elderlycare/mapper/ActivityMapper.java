package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Activity;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ActivityMapper {
    @Select("select * from activities where created_at >= NOW() - INTERVAL 7 DAY;")
    List<Activity> recentItems();

    @Select("select * from activities where activity_status = #{currentStatus}")
    List<Activity> status(String currentStatus);

    @Select("select * from activities where id = #{id}")
    Activity getById(Integer id);

    @Insert("insert into activities (name, description, start_time, end_time, location, max_participants, activity_status, organizer_id, created_at, updated_at) " +
            "values (#{name}, #{description}, #{startTime}, #{endTime}, #{location}, #{maxParticipants}, #{activityStatus}, #{organizerId}, #{createdAt}, #{updatedAt})")
    void addActivity(Activity activity);

    @Delete("delete from activities where id = #{id}")
    void deleteActivity(Integer id);
    @Select("select * from activities where created_at >= #{start} and created_at <= #{end}")
    List<Activity> range(LocalDate start, LocalDate end);
    @Select("select * from elderly_info where id = #{id}")
    int getByElderlyId(Integer id);
    @Insert("insert into activity_participants (activity_id, elderly_id) values (#{id}, #{id})")
    void joinActivity(Integer id);

}
