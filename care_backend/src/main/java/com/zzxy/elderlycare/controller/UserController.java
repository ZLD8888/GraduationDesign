package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.dto.ChangePassword;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.security.JwtAuthenticationFilter;
import com.zzxy.elderlycare.service.UserSersive;
import com.zzxy.elderlycare.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserSersive userSersive;

    @Autowired
    JwtUtil jwtUtil;
    JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * @param request  请求头
     * @return 当前用户信息
     * @description 获取当前用户信息
     */
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

    /**
     * @return    结果
     * @description 获取所有护工信息
     */
    @GetMapping("/caregivers")
    public Result getCaregivers() {
        List<User> caregivers = userSersive.getCaregivers();
        return Result.success("200", "成功", caregivers);
    }

    @PostMapping("/change-password")
    public Result changePassword(@RequestBody ChangePassword changePassword, HttpServletRequest request) {
        log.info("changePassword:{}", changePassword);
        log.info("request:{}", request);
        // 获取token
        String token = request.getHeader("Authorization");
        log.info("token:{}", token);
        if (token!= null && token.startsWith("Bearer ")) {
            token = token.substring(7); // 去掉 "Bearer " 前缀
        } else {
            return Result.error("401", "无效的token");
        }
        // 验证token
        if (jwtUtil.validateToken(token)) {
            User current = userSersive.current(token);
            log.info("当前用户:{}", current);
            userSersive.changePassword(current.getId(),changePassword);
        }
        return Result.success("200","修改成功");
    }
}
