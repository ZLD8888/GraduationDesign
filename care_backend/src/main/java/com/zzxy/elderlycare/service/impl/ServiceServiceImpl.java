package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.dto.AppointmentUserDto;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Services;
import com.zzxy.elderlycare.mapper.ServiceMapper;
import com.zzxy.elderlycare.service.ServiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Slf4j
@Service
public class ServiceServiceImpl implements ServiceService {
    @Autowired
    private ServiceMapper serviceMapper;
    @Override
    public List<Services> getServiceList() {
        List<Services> dbserviceList = serviceMapper.selectAllList();
        return dbserviceList;
    }

    @Override
    public List<Appointments> getAppointmentList() {
        List<Appointments> dbappointmentList = serviceMapper.selectAllAppointment();
        return dbappointmentList;
    }

    @Override
    public void addService(Services service) {
        log.info("添加服务");
        service.setCreateTime(LocalDateTime.now());
        service.setUpdateTime(LocalDateTime.now());
        serviceMapper.addService(service);
    }

    @Override
    public void deleteService(Integer id) {
        serviceMapper.deleteService(id);
    }

    @Override
    public Services getServiceInfoById(Integer id) {
        Services dbserviceInfoById = serviceMapper.getServiceInfoById(id);
        return dbserviceInfoById;
    }

    @Override
    public void updateService(Services service)
    {
        service.setUpdateTime(LocalDateTime.now());
        serviceMapper.updateService(service);
    }

    @Override
    public List<Services> getTimeSlots(Integer serviceID) {
        List<Services> dbtimeSlots = serviceMapper.getTimeSlots(serviceID);
        return dbtimeSlots;
    }

    @Override
    public int getServiceAppointmentCount(Integer serviceID, String date) {
        int serviceAppointmentCount = serviceMapper.getServiceAppointmentCount(serviceID, date);
        return serviceAppointmentCount;
    }

    @Override
    public void addAppointment(AppointmentUserDto appointmentUserDto) {
        appointmentUserDto.setCreateTime(LocalDateTime.now());
        appointmentUserDto.setUpdateTime(LocalDateTime.now());
        serviceMapper.addAppointment(appointmentUserDto);
        log.info("添加预约成功");
    }

    @Override
    public List<Appointments> getElderlyAppointments(Integer userID) {
        List<Appointments> elderlyAppointments = serviceMapper.getElderlyAppointments(userID);
        log.info("查询到老人的预约列表：{}",elderlyAppointments);
        return elderlyAppointments;
    }

    @Override
    public void cancelAppointment(String appointmentNo) {
        serviceMapper.cancelAppointment(appointmentNo);
    }

    @Override
    public Appointments getAppointmentByNo(String appointmentNo) {
        Appointments dbappointment = serviceMapper.getAppointmentByNo(appointmentNo);
        return dbappointment;
    }

    @Override
    public List<Appointments> getStaffAppointments(Integer staffId) {
        List<Appointments> staffAppointments = serviceMapper.getStaffAppointments(staffId);
        return staffAppointments;
    }

    /**
     * @param userId 用户ID
     * @return 老人信息
     * 根据返回的用户ID查询老人信息
     */
    @Override
    public Elderly getElderlyInfoByReturnUserID(Integer userId) {
        Elderly elderly = serviceMapper.getElderlyInfoByReturnUserID(userId);
        log.info("根据返回的用户ID查询老人信息：{}",elderly);
        return elderly;
    }

    @Override
    public List<Elderly> getElderlyNameByFamilyId(Integer familyId) {
        List<Elderly> dbelderlyNameByFamilyId = serviceMapper.getElderlyNameByFamilyId(familyId);
        return dbelderlyNameByFamilyId;
    }

    @Override
    public List<Appointments> getFamilyAppointments(Integer familyId) {
        List<Appointments> familyAppointments = serviceMapper.getFamilyAppointments(familyId);
        return familyAppointments;
    }
    @Override
    public boolean hasTodayAppointment(Long serviceId, Long userId, Long elderlyId, String date) {
        return serviceMapper.countAppointmentsByDateTime(serviceId, userId, elderlyId, date) > 0;
    }
}
