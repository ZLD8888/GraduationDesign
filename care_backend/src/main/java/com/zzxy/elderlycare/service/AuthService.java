package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.dto.RegisterDto;
import com.zzxy.elderlycare.dto.UserLoginDto;

public interface AuthService {
    String login(UserLoginDto userLoginDto);

    void register(RegisterDto registerDto);

    int findByPhone(String phone);
}
