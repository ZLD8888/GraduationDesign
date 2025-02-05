package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/staff")
public class StaffController {
    @Autowired
    private StaffService staffService;

    @GetMapping("/elderly/{stffId}")
    public Result getElderlyInfo(@PathVariable Integer stffId) {
        log.info("查询护工id:{}", stffId);
        // 1.查询护工绑定的老人信息
        List<Elderly> elderlyInfo = staffService.getElderlyInfo(stffId);
        if (elderlyInfo == null) {
            return Result.error("400", "查询失败");
        }
        return Result.success("200", "查询成功", elderlyInfo);
    }
}
