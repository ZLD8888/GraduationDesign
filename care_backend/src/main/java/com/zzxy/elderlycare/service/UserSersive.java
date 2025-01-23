package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.User;

public interface UserSersive {


    User current(String token);
}
