package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.ActivityStatusDto;
import com.zzxy.elderlycare.dto.JoinActivityDto;
import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface ActivityService {
    List<Activity> recentItems();

    List<Activity> status(String currentStatus);

    Activity getById(Integer id);

    void addActivity(Activity activity);

    void deleteActivity(Integer id);

    List<Activity> range(LocalDate start, LocalDate end);

    int getByElderlyId(Integer id);

    User joinActivity(JoinActivityDto joinActivityDto);

    void UpdateActivityInfo(Activity activity);

    void updateActivityStatus(Integer id, ActivityStatusDto activityStatusDto);

    /**
     * 检查用户是否已经报名活动
     * @param activityId 活动ID
     * @param elderlyId 用户ID
     * @return 报名次数
     */
    int checkParticipation(Integer activityId, Integer elderlyId);

    /**
     * 获取活动参与人员列表
     * @param activityId 活动ID
     * @return 参与人员列表
     */
    List<User> getParticipants(Integer activityId);

    void quitActivity(JoinActivityDto joinActivityDto);

    List<Activity> getJoinActivitiesHistory(Integer userId);
}
