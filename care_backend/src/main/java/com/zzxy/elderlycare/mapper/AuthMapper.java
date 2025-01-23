package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.dto.RegisterDto;
import com.zzxy.elderlycare.dto.UserLoginDto;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AuthMapper {
    @Select("select * from users where phone = #{phone}")
    UserLoginDto login(UserLoginDto userLoginDto);

    @Insert("insert into users (phone, password,name,role,created_at,updated_at) values (#{phone}, #{password},#{name},#{role},now(),now())")
    void register(RegisterDto registerDto);
    @Select("select count(*) from users where phone = #{phone}")
    int  findByPhone(String phone);
}
