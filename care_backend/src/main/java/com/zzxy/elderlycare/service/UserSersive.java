package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.ChangePasswordDto;
import com.zzxy.elderlycare.entity.User;

import java.util.List;

public interface UserSersive {


    User current(String token);

    List<User> getCaregivers();

    void changePassword(Integer id, ChangePasswordDto changePassword);

    User getCaregiverById(Integer id);

    Integer getIdByPhone(String phone);
}
