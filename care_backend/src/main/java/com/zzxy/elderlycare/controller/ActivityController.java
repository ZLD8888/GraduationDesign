package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@Slf4j
@RestController
@RequestMapping("/api/activity")
public class ActivityController {
    @Autowired
    private ActivityService activityService;

    /**
     * @return 活动信息
     * @Description: 查询最近一周的活动信息
     */
    @GetMapping("/recent-items")
    public Result recentItems() {
        List<Activity> recentItems = activityService.recentItems();
        return Result.success("200","data",recentItems);
    }

    /**
     * @param currentStatus 前端返回的活动状态
     * @return 活动信息
     * @Description: 查询该状态的活动信息
     */
    @GetMapping("/status/{currentStatus}")
    public Result status(@PathVariable String currentStatus) {
        log.info("currentStatus:{}",currentStatus);
        List<Activity> status = activityService.status(currentStatus);
        return Result.success("200","",status);
    }

    /**
     * @param id 前端返回的活动id
     * @return 活动信息
     * @Description: 根据id查询活动信息
     */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Integer id){
        Activity activity = activityService.getById(id);
        return Result.success("200","",activity);
    }
    /**
     * @param activity 前端返回的活动信息
     * @return 活动信息
     * @Description: 添加活动信息
     */
    @PostMapping
    public Result addActivity(@RequestBody Activity activity){
        log.info("增加活动信息activity:{}",activity);
        activityService.addActivity(activity);
        return Result.success("200","添加成功");
    }

    /**
     * @param id 前端返回的活动id
     * @return 删除成功信息
     * @Description: 删除活动信息
     */
    @DeleteMapping("/{id}")
    public Result deleteActivity(@PathVariable Integer id) {
        log.info("删除活动id:{}",id);
        activityService.deleteActivity(id);
        return Result.success("200", "删除成功");
    }

    /**
     * @param start 前端返回的活动开始时间
     * @param end 前端返回的活动结束时间
     * @return 活动信息
     * @Description: 查询活动时间范围的活动信息
     */
    @GetMapping("/range")
    public Result range(@RequestParam("startDate") LocalDate start, @RequestParam("endDate") LocalDate end){
        log.info("查询活动时间范围:{}-{}",start,end);
        List<Activity> range = activityService.range(start, end);
        log.info("返回的活动数量: {}", range.size());
        return Result.success("200","成功",range);
    }

    @PostMapping("/{id}/join")
    public Result joinActivity(@PathVariable Integer id) {
        log.info("报名活动id:{}",id);
        if (id == null) {
            return Result.error("400", "活动id不能为空");
        }
        activityService.joinActivity(id);
        return Result.success("200", "报名成功");
    }
}
