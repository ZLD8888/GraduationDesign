package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.ElderlyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/elderly")
public class ElderlyController {
    @Autowired
    private ElderlyService elderlyService;

    @GetMapping
    public Result allelederlyInfo(){
        log.info("查询所有老人信息");
        List<Elderly> elderlies = elderlyService.allelederlyInfo();
        return Result.success("200","成功",elderlies);
    }
}
