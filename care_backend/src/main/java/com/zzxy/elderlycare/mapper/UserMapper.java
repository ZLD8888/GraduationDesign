package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface UserMapper {
    @Select("select * from users where phone = #{phone}")
    User getCurrent(String phone);

    @Select("select * from users where phone = #{phone}")
    User getUserByPhone(String phone);
    @Select("select * from users where role = 'STAFF'")
    List<User> getCaregivers();

    @Update("update users set password = #{newPassword} where id = #{id}")
    void changePassword(Integer id, String newPassword);
    @Select("select * from users where id = #{id}")
    User getUserById(Integer id);

    @Select("select * from users where id = #{id}")
    User getCaregiverById(Integer id);
}
