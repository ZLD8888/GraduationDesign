package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.dto.RegisterDto;
import com.zzxy.elderlycare.dto.UserLoginDto;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    /**
     * @param userLoginDto  用户登录信息
     * @return token
     * @throws RuntimeException 手机号或密码不能为空
     */
    @PostMapping("/login")
    public Result login(@RequestBody UserLoginDto userLoginDto) {
        if (userLoginDto.getPhone() == null || userLoginDto.getPassword() == null) {
            throw new RuntimeException("手机号或密码不能为空");
        }
//        if (userLoginDto.getPhone().length() != 11 && userLoginDto.getPhone().length() != 18) {
//            throw new RuntimeException("手机号格式错误");
//        }
        if (userLoginDto.getPassword().length() < 6 || userLoginDto.getPassword().length() > 16) {
            throw new RuntimeException("密码长度错误");
        }
        String token = authService.login(userLoginDto);
        if (token == null) {
            return Result.error("403","手机号或密码错误");
        }

        return Result.success("200","token",token);
    }

    @PostMapping("/register")
    public Result register(@RequestBody RegisterDto registerDto) {
        log.info("注册信息:{}",registerDto);
        if (registerDto.getPhone() == null || registerDto.getPassword() == null) {
            throw new RuntimeException("手机号或密码不能为空");
        }
        if (registerDto.getPhone().length()!= 11) {
            throw new RuntimeException("手机号格式错误");
        }
        if (registerDto.getPassword().length() < 6 || registerDto.getPassword().length() > 25) {
            throw new RuntimeException("密码长度错误");
        }
        authService.register(registerDto);
        return Result.success("200","注册成功");
    }

}
