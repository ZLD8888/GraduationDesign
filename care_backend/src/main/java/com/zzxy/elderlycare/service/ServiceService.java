package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.AppointmentUserDto;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Services;

import java.util.List;

public interface ServiceService {
    List<Services> getServiceList();

    List<Appointments> getAppointmentList();

    void addService(Services service);

    void deleteService(Integer id);

    Services getServiceInfoById(Integer id);

    void updateService(Services service);

    List<Services> getTimeSlots(Integer serviceID);

    int getServiceAppointmentCount(Integer serviceID, String date);

    void addAppointment(AppointmentUserDto appointmentUserDto);

    List<Appointments> getElderlyAppointments(Integer userID);

    void cancelAppointment(String appointmentNo);

    Appointments getAppointmentByNo(String appointmentNo);

    List<Appointments> getStaffAppointments(Integer staffId);
    /**
     * @param userId 用户ID
     * @return 老人信息
     * 根据返回的用户ID查询老人信息
     * */
    Elderly getElderlyInfoByReturnUserID(Integer userId);

    List<Elderly> getElderlyNameByFamilyId(Integer familyId);

    List<Appointments> getFamilyAppointments(Integer familyId);

    boolean hasTodayAppointment(Long serviceId, Long userId, Long elderlyId, String date);
}
