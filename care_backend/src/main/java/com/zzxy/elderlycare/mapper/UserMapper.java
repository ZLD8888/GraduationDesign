package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {
    @Select("select * from users where phone = #{phone}")
    User getCurrent(String phone);

    @Select("select * from users where phone = #{phone}")
    User getUserByPhone(String phone);
}
