package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.dto.ActivityStatusDto;
import com.zzxy.elderlycare.dto.JoinActivityDto;
import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.User;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ActivityMapper {
    @Select("SELECT a.*, u.name as organizer_name FROM activities a " +
            "LEFT JOIN users u ON a.organizer_id = u.id " +
            "WHERE a.start_time >= NOW() - INTERVAL 7 DAY")
    List<Activity> recentItems();

    @Select("SELECT a.*, u.name as organizer_name FROM activities a " +
            "LEFT JOIN users u ON a.organizer_id = u.id " +
            "WHERE a.activity_status = #{currentStatus}")
    List<Activity> status(String currentStatus);

    @Select("SELECT a.*, u.name as organizer_name, " +
            "COALESCE((" +
            "  SELECT JSON_ARRAYAGG(" +
            "    JSON_OBJECT(" +
            "      'id', u2.id, " +
            "      'name', u2.name" +
            "    )" +
            "  ) " +
            "  FROM activity_participants ap " +
            "  JOIN users u2 ON ap.elderly_id = u2.id " +
            "  WHERE ap.activity_id = a.id" +
            "), '[]') as participants, " +
            "(SELECT COUNT(*) FROM activity_participants WHERE activity_id = a.id) as current_participants " +
            "FROM activities a " +
            "LEFT JOIN users u ON a.organizer_id = u.id " +
            "WHERE a.id = #{id}")
    Activity getById(Integer id);

    @Insert("insert into activities (name, description, start_time, end_time, location, max_participants, activity_status, organizer_id, created_at, updated_at) " +
            "values (#{name}, #{description}, #{startTime}, #{endTime}, #{location}, #{maxParticipants}, #{activityStatus}, #{organizerId}, #{createdAt}, #{updatedAt})")
    void addActivity(Activity activity);

    @Delete("delete from activities where id = #{id}")
    void deleteActivity(Integer id);

    @Select("SELECT a.*, u.name as organizer_name FROM activities a " +
            "LEFT JOIN users u ON a.organizer_id = u.id " +
            "WHERE a.created_at >= #{start} and a.created_at <= #{end}")
    List<Activity> range(LocalDate start, LocalDate end);

    @Select("select count(*) from activity_participants where elderly_id = #{id}")
    int getByElderlyId(Integer id);

    @Insert("INSERT INTO activity_participants (activity_id, elderly_id) VALUES (#{activityId}, #{elderlyId})")
    void joinActivity(JoinActivityDto joinActivityDto);

    @Update("UPDATE activities SET current_participants = " +
            "(SELECT COUNT(*) FROM activity_participants WHERE activity_id = #{activityId}) " +
            "WHERE id = #{activityId}")
    void updateActivityInfo(Integer activityId);

    @Select("SELECT * FROM users WHERE id = #{elderlyId}")
    User getByIdForElder(Integer elderlyId);

    @Update("update activities set name = #{name}, description = #{description}, start_time = #{startTime}, " +
            "end_time = #{endTime}, location = #{location}, max_participants = #{maxParticipants}, " +
            "activity_status = #{activityStatus}, organizer_id = #{organizerId}, updated_at = #{updatedAt} " +
            "where id = #{id}")
    void UpdateActivityInfo(Activity activity);

    @Update("update activities set activity_status = #{activityStatusDto.status}, updated_at = now() where id = #{id}")
    void UpdateActivityStatus(Integer id, ActivityStatusDto activityStatusDto);

    @Select("select count(*) from activity_participants where activity_id = #{activityId} AND elderly_id = #{elderlyId}")
    int checkParticipation(@Param("activityId") Integer activityId, @Param("elderlyId") Integer elderlyId);

    @Select("SELECT u.* FROM users u " +
            "JOIN activity_participants ap ON u.id = ap.elderly_id " +
            "WHERE ap.activity_id = #{activityId}")
    List<User> getParticipants(Integer activityId);

    @Delete("delete from activity_participants where activity_id = #{activityId} AND elderly_id = #{elderlyId}")
    void quitActivity(JoinActivityDto joinActivityDto);

    @Select("select * from activities where id in (select activity_id from activity_participants where elderly_id = #{userId})")
    List<Activity> getJoinActivitiesHistory(Integer userId);

    @Select("SELECT * FROM activities")
    List<Activity> getAllActivities();

    @Select("select * from activities where start_time >= now() - interval 1 hour")
    List<Activity> getUpcomingActivities();
}
