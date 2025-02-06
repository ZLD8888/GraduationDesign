package com.zzxy.elderlycare.controller;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.PutObjectRequest;
import com.zzxy.elderlycare.dto.AppointmentUserDto;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.entity.Services;
import com.zzxy.elderlycare.service.ServiceService;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Delete;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    private ServiceService serviceService;
    @Autowired
    private OSS ossClient;
    @Value("${aliyun.oss.bucketName}")
    private String bucketName;
    @Value("${aliyun.oss.endpoint}")
    private String endpoint;
    /**
     * @return  服务项目列表
     * 获取服务列表
     */
    @GetMapping
    public Result getServiceList() {
        List<Services> serviceList = serviceService.getServiceList();
        return Result.success("200", "获取服务列表成功", serviceList);
    }
    /**
     * @return  预约列表
     * 获取预约列表(管理员)
     */
    @GetMapping("/appointments")
    public Result getAppointmentList() {
        List<Appointments> appointmentList = serviceService.getAppointmentList();
        log.info("返回的预约数据：{}",appointmentList);
        return Result.success("200", "获取预约列表成功",appointmentList);
    }
    /**
     * 获取单个服务详情
     */
    @GetMapping("/{id}")
    public Result getServiceDetail(@PathVariable Integer id) {
        Services service = serviceService.getServiceInfoById(id);
        if (service == null) {
            return Result.error("404", "服务不存在");
        }
        // 确保 availableDays 不为 null
        if (service.getAvailableDays() == null) {
            service.setAvailableDays("");
        }
        log.info("返回的服务数据：{}", service);
        return Result.success("200", "获取服务详情成功", service);
    }
    /**
     * 上传服务图片到阿里云OSS
     * @param file 上传的文件
     * @return 上传结果，包含图片访问URL
     */
    @PostMapping("/upload")
    public Result uploadServiceImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("400", "上传文件为空");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = "services/" + UUID.randomUUID().toString() + suffix;
            
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, fileName, file.getInputStream());
            ossClient.putObject(putObjectRequest);
            
            // 修改 URL 构建逻辑，确保格式正确
            String fileUrl = String.format("https://%s.%s/%s", 
                bucketName.trim(),
                endpoint.trim().replace("https://", "").replace("http://", ""), // 移除可能存在的协议前缀
                fileName.trim()
            );
            
            // 添加详细日志
            log.info("OSS上传参数 - Bucket: {}, Endpoint: {}, FileName: {}", bucketName, endpoint, fileName);
            log.info("生成的文件URL: {}", fileUrl);
            
            return Result.success("200", "文件上传成功", fileUrl);

        } catch (Exception e) {
            log.error("文件上传失败", e);
            return Result.error("500", "文件上传失败：" + e.getMessage());
        }
    }
    /**
     * @param service  服务信息
     * @return 添加服务结果
     * 添加服务
     */
    @PostMapping
    public Result addService(@RequestBody Services service) {
        log.info("接收到的服务数据：{}", service);
        serviceService.addService(service);
        return Result.success("200","添加服务成功");
    }
    /**
     * @param id  服务ID
     * @param service 服务信息
     * @return 更新服务结果
     * 更新服务
     */
    @PutMapping("/{id}")
    public Result updateService(@PathVariable Integer id, @RequestBody Services service) {
        // 检查服务是否存在
        Services existingService = serviceService.getServiceInfoById(id);
        if (existingService == null) {
            return Result.error("404", "服务不存在");
        }
        
        // 设置ID确保更新正确的记录
        service.setId(id);
        serviceService.updateService(service);
        return Result.success("200", "更新服务成功");
    }
    /**
     * @param id 服务ID
     * @return 删除服务结果
     * 删除服务
     */
    @DeleteMapping("/{id}")
    public Result deleteService(@PathVariable Integer id) {
        Services serviceInfoById = serviceService.getServiceInfoById(id);
        if (serviceInfoById == null) {
            return Result.error("404", "服务不存在");
        }
        serviceService.deleteService(id);
        return Result.success("200","删除服务成功");
    }
    /**
     * @param serviceID 服务ID
     * @return 时间槽
     * 获取时间槽
     */
    @GetMapping("/{serviceID}/timeslots")
    public Result getTimeSlots(@PathVariable Integer serviceID) {
        log.info("获取时间槽的服务ID: {}", serviceID);
        List<Services> timeSlots = serviceService.getTimeSlots(serviceID);
        log.info("获取到的时间槽: {}", timeSlots);
        return Result.success("200", "获取时间槽成功", timeSlots);
    }
    /**
     * @param serviceID  服务ID
     * @param date       日期
     * @return  预约数量
     * 获取此服务日期预约数量
     */
    @GetMapping("/{serviceID}/appointments/count")
    public Result getServiceAppointmentCount(@PathVariable Integer serviceID,@RequestParam("date") String date) {
        int count = serviceService.getServiceAppointmentCount(serviceID,date);
        return Result.success("200", "获取预约数量成功", count);
    }
    /**
     * @param appointmentUserDto  预约信息
     * @return 添加预约结果
     * 添加预约
     */
    @PostMapping("/appointments")
    public Result addAppointment(@RequestBody AppointmentUserDto appointmentUserDto) {
        log.info("预约信息:{}", appointmentUserDto);
        //返回的用户ID查询老人ID，如过在老人表能查到的话
        Elderly elderly = serviceService.getElderlyInfoByReturnUserID(appointmentUserDto.getUserId());
        log.info("老人信息:{}",elderly);
        if (elderly != null) {
            appointmentUserDto.setElderlyId(elderly.getId());
            serviceService.addAppointment(appointmentUserDto);
        }else {
            serviceService.addAppointment(appointmentUserDto);
        }
        return Result.success("200", "预约成功");
    }
    /**
     * @param userID  用户ID
     * @return  预约列表
     * 获取老人自己的预约列表
     */
    @GetMapping("/elderly/{userID}/appointments")
    public Result getElderlyAppointments(@PathVariable Integer userID) {
        log.info("获取老人预约列表的用户ID: {}", userID);
        List<Appointments> elderlyAppointments = serviceService.getElderlyAppointments(userID);
        return Result.success("200", "获取老人预约列表成功", elderlyAppointments);
    }
    /**
     * @param appointmentNo 预约号
     * @return 取消预约结果
     * 取消预约
     */
    @PostMapping("/appointments/{appointmentNo}/cancel")
    public Result cancelAppointment(@PathVariable String appointmentNo) {
        log.info("取消预约的预约号: {}", appointmentNo);
        Appointments appointment = serviceService.getAppointmentByNo(appointmentNo);
        if (appointment == null) {
            return Result.error("404", "预约不存在");
        }
        if ("CANCELLED".equals(appointment.getStatus())) {
            return Result.error("400", "预约已取消");
        }
        if ("COMPLETED".equals(appointment.getStatus())) {
            return Result.error("400", "预约已完成，无法取消");
        }
        serviceService.cancelAppointment(appointmentNo);
        return Result.success("200", "取消预约成功");
    }

    /**
     * @param staffId 护工用户登录ID
     * @return 护工绑定老人预约服务列表
     * 获取护工绑定老人预约服务列表
     */
    @GetMapping("/staff/{staffId}/appointments")
    public Result getStaffAppointments(@PathVariable Integer staffId) {
        log.info("获取护工绑定老人预约服务列表的护工ID: {}", staffId);
        List<Appointments> appointments = serviceService.getStaffAppointments(staffId);
        log.info("获取到的护工绑定老人预约服务列表: {}", appointments);
        return Result.success("200","查询成功",appointments);
    }

    /**
     * @param familyId 登录角色为家属的用户ID
     * @return 老人姓名和ID列表
     * 获取老人姓名列表
     */
    @GetMapping("/family/{familyId}/elderly")
    public Result getElderlyNameByFamilyId(@PathVariable Integer familyId) {
        log.info("获取老人姓名的家庭ID: {}", familyId);
        List<Elderly> elderlyList = serviceService.getElderlyNameByFamilyId(familyId);
        log.info("获取到的老人姓名列表: {}", elderlyList);
        if (elderlyList.isEmpty()) {
            return Result.error("404", "未找到与该家庭绑定的老人,请先绑定老人");
        }
        return Result.success("200", "获取老人姓名成功", elderlyList);
    }
    @GetMapping("/family/{familyId}/appointments")
    public Result getFamilyAppointments(@PathVariable Integer familyId) {
        log.info("获取家属预约列表的家属ID: {}", familyId);
        List<Appointments> appointments = serviceService.getFamilyAppointments(familyId);
        log.info("获取到的家属预约列表: {}", appointments);
        return Result.success("200", "查询成功", appointments);
    }
}
