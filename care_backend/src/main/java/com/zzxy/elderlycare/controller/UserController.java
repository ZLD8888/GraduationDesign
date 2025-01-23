package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.security.JwtAuthenticationFilter;
import com.zzxy.elderlycare.service.UserSersive;
import com.zzxy.elderlycare.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserSersive userSersive;

    @Autowired
    JwtUtil jwtUtil;
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @GetMapping("/current")
    public Result current(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // 去掉 "Bearer " 前缀
        } else {
            return Result.error("401", "无效的token");
        }

        // 验证token
        if (jwtUtil.validateToken(token)) {
            User current = userSersive.current(token);
            System.out.println("用户信息:" + current);
            return Result.success("200", "成功", current);
        } else {
            return Result.error("401", "无效的token");
        }
    }
}
