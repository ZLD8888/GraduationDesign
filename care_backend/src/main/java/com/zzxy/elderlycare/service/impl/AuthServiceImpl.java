package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.dto.RegisterDto;
import com.zzxy.elderlycare.dto.UserLoginDto;
import com.zzxy.elderlycare.exception.ServiceException;
import com.zzxy.elderlycare.mapper.AuthMapper;
import com.zzxy.elderlycare.service.AuthService;
import com.zzxy.elderlycare.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private AuthMapper authMapper;
    @Autowired
    private JwtUtil jwtUtils;

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    @Override
    public String login(UserLoginDto userLoginDto) {
        UserLoginDto dblogin = authMapper.login(userLoginDto);
        logger.info("dblogin:{}",dblogin);
        if (dblogin == null) {
            throw new ServiceException("403","用户不存在"); //正式上线要改成用户名或密码错误
        }
        if (!userLoginDto.getPassword().equals(dblogin.getPassword())) {
            throw new ServiceException("403","密码错误"); //正式上线要改成用户名或密码错误
        }
        // 生成token
        String token = jwtUtils.generateToken(dblogin.getPhone());
        logger.info("token:{}",token);
        return token;
    }
    //查询用户是否已经注册
    @Override
    public int findByPhone(String phone) {
        return authMapper.findByPhone(phone);
    }


    @Override
    public void register(RegisterDto registerDto) {
        logger.info("注册信息:{}",registerDto);
        if(findByPhone(registerDto.getPhone()) != 0){
            throw new ServiceException("403","用户已存在");
        }
        authMapper.register(registerDto);
        logger.info("注册成功");
    }

}
