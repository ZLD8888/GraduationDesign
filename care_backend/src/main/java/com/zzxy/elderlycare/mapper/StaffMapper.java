package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Elderly;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface StaffMapper {
    @Select("select * from elderly_info where id_card in (select elderly_id from staff_elderly where staff_id = #{stffId})")
    List<Elderly> getElderlyInfo(Integer stffId);
}
