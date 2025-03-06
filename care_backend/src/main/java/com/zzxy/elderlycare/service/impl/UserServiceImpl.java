package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.dto.ChangePasswordDto;
import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.exception.ServiceException;
import com.zzxy.elderlycare.mapper.UserMapper;
import com.zzxy.elderlycare.service.UserSersive;
import com.zzxy.elderlycare.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

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
    public List<User> getCaregivers() {
        List<User> dbcaregivers = userMapper.getCaregivers();
        return dbcaregivers;
    }

    @Override
    public void changePassword(Integer id, ChangePasswordDto changePassword) {
        logger.info("id:{}", id);
        logger.info("changePassword:{}", changePassword);
        User dbuser = userMapper.getUserById(id);
        logger.info("dbuser:{}", dbuser);
        if (dbuser == null) {
            throw new ServiceException("403", "用户不存在");
        }
        if (!dbuser.getPassword().equals(changePassword.getOldPassword())) {
            throw new ServiceException("403", "原密码错误");
        }
        userMapper.changePassword(id, changePassword.getNewPassword());

    }

    @Override
    public User getCaregiverById(Integer id) {
        User caregiverById = userMapper.getCaregiverById(id);
        return caregiverById;
    }

    @Override
    public Integer getIdByPhone(String phone) {
        return userMapper.getIdByPhone(phone);
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
