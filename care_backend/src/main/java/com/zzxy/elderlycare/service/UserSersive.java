package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.ChangePassword;
import com.zzxy.elderlycare.entity.User;

import java.util.List;

public interface UserSersive {


    User current(String token);

    List<User> getCaregivers();

    void changePassword(Integer id, ChangePassword changePassword);
}
