package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.dto.FamilyBindDto;
import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.ElderlyService;
import com.zzxy.elderlycare.service.FamilyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/family")
public class FamilyController {
    @Autowired
    private FamilyService familyService;

    @GetMapping("/elderly/{userId}")
    @ResponseBody
    public Result getBindElderlyInfo(@PathVariable Integer userId){
        log.info("登录用户ID:{}",userId);
        List<Elderly> elderly = familyService.getBindElderlyInfo(userId);
        log.info("绑定的老人信息:{}",elderly);
        return Result.success("200","查询成功",elderly);
    }
    @Transactional
    @PostMapping("/bind")
    @ResponseBody
    public Result bindElderly(@RequestBody FamilyBindDto familyBindDto){
        log.info("绑定信息:{}",familyBindDto);
        //1.判断老人是否存在
        if(!familyService.getElderInfoByIdCard(familyBindDto)){
            return Result.error("400","该老人不存在");
        }
        //1.判断老人是否已经绑定
        if(familyService.getElderByIdCard(familyBindDto)){
            return Result.error("400","该老人已经绑定");
        }
        //2.绑定老人
        familyService.bindElderly(familyBindDto);
        return Result.success("200","绑定成功");
    }

    @PostMapping("/unbind")
    public Result unbindElderly(@RequestBody FamilyBindDto familyBindDto){
        log.info("解绑信息:{}",familyBindDto);
        //1.判断老人是否已经绑定
        if(!familyService.getElderByIdCard(familyBindDto)){
            return Result.error("400","该老人未绑定");
        }
        //2.解绑老人
        familyService.unbindElderly(familyBindDto);
        return Result.success("200","解绑成功");
    }
}
