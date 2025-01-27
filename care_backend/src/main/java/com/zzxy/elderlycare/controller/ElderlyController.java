package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.ElderlyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/elderly")
public class ElderlyController {
    @Autowired
    private ElderlyService elderlyService;

    /**
     * @return    结果
     * @description 查询所有老人信息
     */
    @GetMapping
    public Result allelederlyInfo(){
        log.info("查询所有老人信息");
        List<Elderly> elderlies = elderlyService.allelederlyInfo();
        return Result.success("200","成功",elderlies);
    }

    /**
     * @param elderly  老人信息
     * @return   结果
     * @description 添加老人信息
     */
    @PostMapping
    public Result addElderly(@RequestBody Elderly elderly){
        log.info("添加老人信息:{}",elderly);
        elderlyService.addElderly(elderly);
        return Result.success("200","成功");
    }

    /**
     * @param id  老人id
     * @return    老人信息
     * @description 根据id查询老人信息
     */
    @GetMapping("/{id}")
    public Result getElderlyById(@PathVariable Integer id){
        log.info("查询老人信息:{}",id);
        Elderly elderly = elderlyService.getElderlyById(id);
        return Result.success("200","成功",elderly);
    }

    /**
     * @param id  老人id
     * @return   结果
     * @description 根据id删除老人信息
     */
    @DeleteMapping("/{id}")
    public Result deleteElderlyById(@PathVariable Integer id){
        log.info("删除老人信息:{}",id);
        elderlyService.deleteElderlyById(id);
        return Result.success("200","成功");
    }

    @Transactional
    @PutMapping("/{id}")
    public Result updateElderlyInfo(@PathVariable Integer id ,@RequestBody Elderly elderly){
        log.info("修改老人信息:{}",elderly);
        Elderly elderlyById = elderlyService.getElderlyById(id);
        if (elderlyById == null){
            return Result.error("404","该老人不存在");
        }
        log.info("查出来的老人信息：{}",elderlyById);
        if(!elderly.getIdCard().equals(elderlyById.getIdCard())){
            log.info("修改老人手机号");
            elderlyService.updateUserPhone(elderlyById.getIdCard(),elderly.getIdCard());
        }
        if(elderly.getCaregiverId() == null || !elderly.getCaregiverId().equals(elderlyById.getCaregiverId())){
            log.info("修改护工id");
            elderlyService.updateStaffId(elderlyById.getCaregiverId(), elderly.getCaregiverId());
        }
        elderlyService.updateElderlyInfo(id,elderly);
        return null;
    }
}
