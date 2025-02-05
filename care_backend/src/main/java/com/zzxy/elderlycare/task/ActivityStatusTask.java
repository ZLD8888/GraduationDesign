package com.zzxy.elderlycare.task;

import com.zzxy.elderlycare.dto.ActivityStatusDto;
import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class ActivityStatusTask {

    @Autowired
    private ActivityService activityService;

    @Scheduled(fixedRate = 60000) // 每分钟执行一次
    public void updateActivityStatus() {
        log.info("开始检查活动状态...");
        LocalDateTime now = LocalDateTime.now();

        // 获取所有活动
        List<Activity> activities = activityService.getAllActivities();
        
        for (Activity activity : activities) {
            String currentStatus = activity.getActivityStatus();
            String newStatus = null;

            // 如果活动已取消，跳过状态更新
            if ("CANCELLED".equals(currentStatus)) {
                continue;
            }

            // 判断活动状态
            if (now.isBefore(activity.getStartTime())) {
                newStatus = "PLANNED"; // 未开始
            } else if (now.isAfter(activity.getEndTime())) {
                newStatus = "COMPLETED"; // 已结束
            } else {
                newStatus = "ONGOING"; // 进行中
            }

            // 如果状态需要更新
            if (!newStatus.equals(currentStatus)) {
                ActivityStatusDto statusDto = new ActivityStatusDto();
                statusDto.setStatus(newStatus);
                log.info("活动ID: {}, 状态从 {} 更新为 {}", activity.getId(), currentStatus, newStatus);
                activityService.updateActivityStatus(activity.getId(), statusDto);
            }
        }
        log.info("活动状态检查完成");
    }
} 