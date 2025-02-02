package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.dto.ActivityStatusDto;
import com.zzxy.elderlycare.dto.JoinActivityDto;
import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.mapper.ActivityMapper;
import com.zzxy.elderlycare.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.mapping.Join;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Slf4j
@Service
public class ActivityServiceImpl implements ActivityService {
    @Autowired
    private ActivityMapper activityMapper;
    @Override
    public List<Activity> recentItems() {
        List<Activity> dbrecentItems = activityMapper.recentItems();
        log.info("查询最近的活动:{}",dbrecentItems);
        return dbrecentItems;
    }

    @Override
    public List<Activity> status(String currentStatus) {
        List<Activity> dbstatus = activityMapper.status(currentStatus);
        log.info("查询该状态活动信息:{}",dbstatus);
        return dbstatus;
    }

    @Override
    public Activity getById(Integer id) {
        Activity dbById = activityMapper.getById(id);
        log.info("根据id查询活动信息:{}",dbById);
        return dbById;
    }

    @Override
    public void addActivity(Activity activity) {
        log.info("添加活动信息:{}",activity);
        activity.setCreatedAt(LocalDateTime.now());
        activity.setUpdatedAt(LocalDateTime.now());
        log.info("添加活动信息2:{}",activity);
        activityMapper.addActivity(activity);
    }

    @Override
    public void deleteActivity(Integer id) {
        log.info("删除活动信息:{}",id);
        activityMapper.deleteActivity(id);
    }

    @Override
    public List<Activity> range(LocalDate start, LocalDate end) {
        log.info("查询活动信息的开始时间:{},结束时间:{}",start,end);
        List<Activity> dbrange = activityMapper.range(start, end);
        log.info("查询活动信息的开始时间:{},结束时间:{},结果:{}",start,end,dbrange);
        return dbrange;
    }


    //查询是否存在参加活动的老人
    @Override
    public int getByElderlyId(Integer id) {
        log.info("查询是否存在参加活动的老人:{}",id);
        int i = activityMapper.getByElderlyId(id);
        return i;
    }
    @Override
    public User joinActivity(JoinActivityDto joinActivityDto) {
        log.info("参加活动开始: {}", joinActivityDto);
        try {
            // 1. 添加参与记录
            activityMapper.joinActivity(joinActivityDto);
            log.info("添加参与记录成功");

            // 2. 更新活动参与人数
            activityMapper.updateActivityInfo(joinActivityDto.getActivityId());
            log.info("更新活动参与人数成功");

            return activityMapper.getByIdForElder(joinActivityDto.getElderlyId());
        } catch (Exception e) {
            log.error("参加活动失败", e);
            throw e;
        }
    }

    @Override
    public void UpdateActivityInfo(Activity activity) {
        log.info("更新活动信息:{}",activity);
        activity.setUpdatedAt(LocalDateTime.now());
        activityMapper.UpdateActivityInfo(activity);
    }

    @Override
    public void updateActivityStatus(Integer id, ActivityStatusDto activityStatusDto) {
        activityMapper.UpdateActivityStatus(id,activityStatusDto);
    }

    @Override
    public int checkParticipation(Integer activityId, Integer elderlyId) {
        log.info("检查用户是否已报名活动: activityId={}, elderlyId={}", activityId, elderlyId);
        return activityMapper.checkParticipation(activityId, elderlyId);
    }

    @Override
    public List<User> getParticipants(Integer activityId) {
        log.info("获取活动参与人员列表: activityId={}", activityId);
        return activityMapper.getParticipants(activityId);
    }

    @Override
    public void quitActivity(JoinActivityDto joinActivityDto) {
        activityMapper.quitActivity(joinActivityDto);
    }

    @Override
    public List<Activity> getJoinActivitiesHistory(Integer userId) {
        List<Activity> dbjoinActivitiesHistory = activityMapper.getJoinActivitiesHistory(userId);
        return dbjoinActivitiesHistory;
    }

}
