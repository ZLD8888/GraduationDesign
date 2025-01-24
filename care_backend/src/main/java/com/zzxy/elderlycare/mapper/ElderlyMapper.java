package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Elderly;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ElderlyMapper {
    @Select("select * from elderly_info")
    List<Elderly> allelederlyInfo();

    @Insert("insert into elderly_info(name, gender, birth_date, id_card, bed_number, check_in_date, caregiver_id, health_condition, dietary_restrictions, emergency_contact_name, emergency_contact_phone, created_at, updated_at) " +
            "values(#{name}, #{gender}, #{birthDate}, #{idCard}, #{bedNumber}, #{checkInDate}, #{caregiverId}, #{healthCondition}, #{dietaryRestrictions}, #{emergencyContactName}, #{emergencyContactPhone}, #{createdAt}, #{updatedAt})")
    void addElderly(Elderly elderly);

    @Insert("insert into users(phone, password, name, role, created_at, updated_at) " +
            "VALUES (#{idCard}, '123456', #{name}, 'ELDERLY', #{createdAt}, #{updatedAt})")
    void oldManregister(Elderly elderly);
    @Select("select * from elderly_info where id = #{id}")
    Elderly getElderlyById(Integer id);

    @Delete("delete from elderly_info where id = #{id}")
    void deleteElderlyById(Integer id);
    @Insert("insert into user_elderly(user_id, elderly_id) values(#{userId}, #{elderlyId})")
    void addElderlyAndUserId(Integer userId, Integer elderlyId);

    @Select("select * from elderly_info where id_card = #{idCard}")
    Elderly getElderlyByIdCard(String idCard);
}
