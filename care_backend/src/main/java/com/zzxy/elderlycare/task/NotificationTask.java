package com.zzxy.elderlycare.task;

import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.entity.Message;
import com.zzxy.elderlycare.service.ActivityService;
import com.zzxy.elderlycare.service.AppointmentService;
import com.zzxy.elderlycare.service.MessagesService;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Select;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class NotificationTask {
    @Autowired
    private MessagesService messageService;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private AppointmentService appointmentService;

    // 每分钟执行一次
    @Scheduled(fixedRate = 60000)
    public void checkAndSendNotifications() {
        try {
            // 检查活动
            checkUpcomingActivities();
            // 检查服务预约
            checkUpcomingAppointments();
        } catch (Exception e) {
            log.error("发送通知失败", e);
        }
    }

    private void checkUpcomingActivities() {
        log.info("开始检查即将开始的活动...");
        // 获取一小时后开始的活动
        List<Activity> activities = activityService.getUpcomingActivities();
        for (Activity activity : activities) {
            try {
                // 检查是否已经发送过通知
                if (messageService.hasNotificationBeenSent("ACTIVITY", Long.valueOf(activity.getId()))) {
                    log.info("活动通知已发送过，跳过。活动ID: {}", activity.getId());
                    continue;
                }
                // 向报名的用户发送通知
                messageService.sendActivityNotification(activity);
                log.info("已发送活动通知, 活动ID: {}", activity.getId());
            } catch (Exception e) {
                log.error("发送活动通知失败, 活动ID: {}", activity.getId(), e);
            }
        }
    }

    private void checkUpcomingAppointments() {
        log.info("开始检查即将开始的预约...");
        // 获取一小时后的预约
        List<Appointments> appointments = appointmentService.getUpcomingAppointments();
        log.info("即将开始的预约:{}", appointments);
        for (Appointments appointment : appointments) {
            try {
                // 检查是否已经发送过通知
                if (messageService.hasNotificationBeenSent("SERVICE", Long.valueOf(appointment.getServiceId()))) {
                    log.info("服务预约通知已发送过，跳过。预约编号: {}", appointment.getAppointmentNo());
                    continue;
                }
                // 向预约用户发送通知
                messageService.sendServiceNotification(appointment);
                log.info("已发送服务预约通知, 预约编号: {}", appointment.getAppointmentNo());
            } catch (Exception e) {
                log.error("发送服务预约通知失败, 预约编号: {}", appointment.getAppointmentNo(), e);
            }
        }
    }
}
