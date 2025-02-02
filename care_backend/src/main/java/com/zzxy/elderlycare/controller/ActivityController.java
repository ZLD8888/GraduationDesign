package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.dto.ActivityStatusDto;
import com.zzxy.elderlycare.dto.JoinActivityDto;
import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.service.ActivityService;
import com.zzxy.elderlycare.service.UserSersive;
import com.zzxy.elderlycare.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
@Slf4j
@RestController
@RequestMapping("/api/activity")
public class ActivityController {
    @Autowired
    private ActivityService activityService;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    UserSersive userSersive;
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

    @PutMapping("/{id}")
    public Result updateActivity(@PathVariable Integer id, @RequestBody Activity activity) {
        log.info("更新活动信息id:{}", id);
        activity.setId(id);
        activityService.UpdateActivityInfo(activity);
        return Result.success("200", "更新成功");
    }

    @PutMapping("/{id}/status")
    public Result updateActivityStatus(@PathVariable Integer id, @RequestBody ActivityStatusDto activityStatusDto) {
        log.info("更新活动状态id:{},status:{}", id, activityStatusDto);
        activityService.updateActivityStatus(id, activityStatusDto);
        return Result.success("200", "更新成功");
    }

    /**
     * 检查用户是否已报名活动
     */
    @GetMapping("/check/{activityId}/{userId}")
    public Result checkParticipation(@PathVariable Integer activityId, @PathVariable Integer userId) {
        log.info("检查用户是否已报名活动: activityId={}, userId={}", activityId, userId);
        int count = activityService.checkParticipation(activityId, userId);
        return Result.success("200", "查询成功", count > 0);
    }

    /**
     * 获取活动参与人员列表
     */
    @GetMapping("/joinpeople/{activityId}")
    public Result getParticipants(@PathVariable Integer activityId) {
        log.info("获取活动参与人员列表: activityId={}", activityId);
        List<User> participants = activityService.getParticipants(activityId);
        return Result.success("200", "获取成功", participants);
    }

    /**
     * @param joinActivityDto  活动id和老人id
     * @return 报名成功信息，或者报名失败信息，或者活动不存在信息，或者活动已满信息，或者您已报名该活动信息，或者活动已结束信息，或者活动未开始信息，或者活动已取消信息
     * @Description: 报名活动
     */
    @PostMapping("/{id}/join")
    public Result joinActivity(@RequestBody JoinActivityDto joinActivityDto) {
        log.info("报名活动信息: {}", joinActivityDto);
        
        // 验证活动是否存在
        Activity activity = activityService.getById(joinActivityDto.getActivityId());
        if (activity == null) {
            return Result.error("400", "活动不存在");
        }

        // 检查用户是否已经报名
        int participationCount = activityService.checkParticipation(
            joinActivityDto.getActivityId(), 
            joinActivityDto.getElderlyId()
        );
        log.info("用户报名状态检查结果: {}", participationCount);
        
        if (participationCount > 0) {
            return Result.error("400", "您已报名该活动");
        }
        
        // 验证活动是否已满
        if (activity.getMaxParticipants() != null && 
            activity.getCurrentParticipants() >= activity.getMaxParticipants()) {
            return Result.error("400", "活动已满");
        }
        
        // 验证活动状态
        String status = activity.getActivityStatus();
        if ("COMPLETED".equals(status)) {
            return Result.error("400", "活动已结束");
        }
        if ("CANCELLED".equals(status)) {
            return Result.error("400", "活动已取消");
        }

        try {
            // 执行报名操作
            activityService.joinActivity(joinActivityDto);
            return Result.success("200", "报名成功");
        } catch (Exception e) {
            log.error("报名失败", e);
            return Result.error("500", "报名失败：" + e.getMessage());
        }
    }

    @PostMapping("/{activityId}/quit")
    public Result quitActivity(@RequestBody JoinActivityDto joinActivityDto) {
        log.info("退出活动信息: {}", joinActivityDto);
        // 验证活动是否存在
        Activity activity = activityService.getById(joinActivityDto.getActivityId());
        if (activity == null) {
            return Result.error("400", "活动不存在");
        }
        activityService.quitActivity(joinActivityDto);
        return Result.success("200", "退出成功");
    }

    @GetMapping("/history/{userId}")
    public Result getJoinActivitiesHistory(@PathVariable Integer userId){
        log.info("获取用户历史活动信息: {}", userId);
        //先判断用户是老人还是家属
        //如何是家属，先去查找家属绑定老人的信息，根据这些老人信息，再去查找活动信息
        //如果是老人，返回所有参与的活动
        List<Activity> joinActivitiesHistory = activityService.getJoinActivitiesHistory(userId);
        return Result.success("200", "获取成功",joinActivitiesHistory);
    }
}
