package com.zzxy.elderlycare.task;

import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.service.AppointmentService;
import com.zzxy.elderlycare.service.ServiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
public class AppointmentStatusTask {
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private ServiceService serviceService;
    @Scheduled(fixedRate = 60000) // 每分钟执行一次
    public void updateAppointmentStatus() {
        log.info("开始更新预约状态");
        List<Appointments> appointments = serviceService.getAppointmentList();
        LocalDateTime now = LocalDateTime.now();
        for (Appointments appointment : appointments) {
            String status = appointment.getStatus();
            String newStatus = null;
            if (status.equals("CANCELLED") || status.equals("COMPLETED")){
                continue;
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String appointmentTime = appointment.getData()+" "+appointment.getTime();
            LocalDateTime appointmentTime1 = LocalDateTime.parse(appointmentTime,formatter);
            if(now.isAfter(appointmentTime1)){
                newStatus = "COMPLETED";
            }
            if(now.isBefore(appointmentTime1)){
                newStatus = "CONFIRMED";
            }
            if(status == null){
                newStatus = "CONFIRMED";
            }
            if(!newStatus.equals(status)) {
                Appointments appointments1 = new Appointments();
                appointments1.setStatus(newStatus);
                log.info("更新预约状态为：{} ,编号为：{}",newStatus,appointment.getAppointmentNo());
                appointmentService.updateAppointmentStatus(appointment.getAppointmentNo(),appointments1);
            }
        }
        log.info("更新预约状态完成");
    }
}
