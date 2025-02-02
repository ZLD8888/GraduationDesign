package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.dto.FamilyBindDto;
import com.zzxy.elderlycare.entity.Elderly;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FamilyMapper {
    @Select("select * from elderly_info where name=#{elderlyName} and id_card=#{elderlyIdCard}")
    Boolean getElderInfoByIdCard(FamilyBindDto familyBindDto);

    @Select("select * from elderly_info where id_card in (select elderly_id from family_elderly where family_userid=#{userID})")
    List<Elderly> getBindElderlyInfo(Integer userID);

    @Select("select * from family_elderly where elderly_id=#{elderlyIdCard} and family_userid=#{familyId}")
    Boolean getElderByIdCard(FamilyBindDto familyBindDto);

    @Insert("insert into family_elderly (family_userid,elderly_id) values (#{familyId},#{elderlyIdCard})")
    void bindElderly(FamilyBindDto familyBindDto);

    @Delete("delete from family_elderly where elderly_id=#{elderlyIdCard} and family_userid=#{familyId}")
    void unbindElderly(FamilyBindDto familyBindDto);
}
