package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.AppointmentUserDto;
import com.zzxy.elderlycare.entity.Appointments;
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
}
