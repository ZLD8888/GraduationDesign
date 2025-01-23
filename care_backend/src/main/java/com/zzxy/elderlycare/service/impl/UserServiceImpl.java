package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.exception.ServiceException;
import com.zzxy.elderlycare.mapper.UserMapper;
import com.zzxy.elderlycare.security.JwtAuthenticationFilter;
import com.zzxy.elderlycare.service.UserSersive;
import com.zzxy.elderlycare.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserServiceImpl implements UserSersive, UserDetailsService {
    @Autowired
    UserMapper userMapper;

    @Autowired
    JwtUtil jwtUtil;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Override
    public User current(String token) {
        // 从token中获取当前用户
        String phone = jwtUtil.getPhoneFromToken(token);
        // 从数据库中获取当前用户
        User dbcurrent = userMapper.getCurrent(phone);
        logger.info("当前用户:{}", dbcurrent);
        if (dbcurrent == null) {
            throw new ServiceException("403", "当前用户不存在");
        }
        return dbcurrent;
    }

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        User user = userMapper.getUserByPhone(phone); // 确保这个方法能正确返回用户
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在: " + phone);
        }
        return new org.springframework.security.core.userdetails.User(
            user.getPhone(),
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}
