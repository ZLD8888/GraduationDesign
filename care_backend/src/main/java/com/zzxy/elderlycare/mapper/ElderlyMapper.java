package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Elderly;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ElderlyMapper {
    @Select("select * from elderly_info")
    List<Elderly> allelederlyInfo();
}
