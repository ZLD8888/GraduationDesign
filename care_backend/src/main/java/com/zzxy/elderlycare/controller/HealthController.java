package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Elderly;
import com.zzxy.elderlycare.entity.HealthData;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.HealthDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private HealthDataService healthDataService;

    @GetMapping("/history")
    public Result getHistoryData(
            @RequestParam Long elderlyId,
            @RequestParam String range) {
        try {
            return Result.success(
                "200",
                "获取历史数据成功",
                healthDataService.getHistoryData(elderlyId, range)
            );
        } catch (Exception e) {
            log.error("获取历史数据失败", e);
            return Result.error("500", "获取历史数据失败");
        }
    }

    @GetMapping("/abnormal")
    public Result getAbnormalData(@RequestParam Long elderlyId) {
        try {
            return Result.success(
                "200",
                "获取异常数据成功",
                healthDataService.getRecentAbnormalData(elderlyId)
            );
        } catch (Exception e) {
            log.error("获取异常数据失败", e);
            return Result.error("500", "获取异常数据失败");
        }
    }

    @PostMapping("/data")
    public Result receiveHealthData(@RequestBody HealthData data) {
        try {
            healthDataService.handleRealTimeData(data);
            return Result.success("200", "数据接收成功");
        } catch (Exception e) {
            log.error("数据接收失败", e);
            return Result.error("500", "数据接收失败");
        }
    }

    /**
     * 获取老人列表
     * @param role 用户角色
     * @param userId 用户ID
     * @return 老人列表
     */
    @GetMapping("/elderly/list")
    public Result getElderlyList(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long userId) {
        try {
            List<Elderly> elderlyList;
            
            if ("ADMIN".equals(role)) {
                elderlyList = healthDataService.getAllElderlyList();
            } else if ("STAFF".equals(role)) {
                elderlyList = healthDataService.getElderlyListByStaffId(userId);
            } else if ("FAMILY".equals(role)) {
                elderlyList = healthDataService.getElderlyListByFamilyId(userId);
            } else if ("ELDERLY".equals(role)) {
                Elderly elderly = healthDataService.getElderlyById(userId);
                elderlyList = elderly != null ? Collections.singletonList(elderly) : Collections.emptyList();
            } else {
                return Result.error("400", "无效的用户角色");
            }

            return Result.success(
                "200",
                "获取老人列表成功",
                elderlyList
            );
        } catch (Exception e) {
            log.error("获取老人列表失败", e);
            return Result.error("500", "获取老人列表失败");
        }
    }
    
} 