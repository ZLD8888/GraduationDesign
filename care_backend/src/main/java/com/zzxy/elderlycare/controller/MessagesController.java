package com.zzxy.elderlycare.controller;

import com.zzxy.elderlycare.entity.Message;
import com.zzxy.elderlycare.entity.Result;
import com.zzxy.elderlycare.service.MessagesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/messages")
public class MessagesController {
    @Autowired
    private MessagesService messagesService;

    /**
     * 查询消息列表
     * @param type 消息类型
     * @param receiverId 接收者ID
     * @return 查询到的消息
     */
    @GetMapping
    public Result getMessages(
            @RequestParam("type") String type,
            @RequestParam("receiverId") Long receiverId) {
        log.info("查询消息，类型:{}, 接收者ID:{}", type, receiverId);
        List<Message> messages;
        if(type.equals("ALL")) {
            messages = messagesService.getMessagesByReceiverId(receiverId);
        } else {
            messages = messagesService.getMessagesByTypeAndReceiverId(type, receiverId);
        }
        log.info("查询到的消息数量:{}", messages.size());
        return Result.success("200", "查询成功", messages);
    }

    /**
     * 添加系统消息
     * @param message 消息内容
     * @return 添加结果
     */
    @PostMapping("/system")
    public Result addSystemMessage(@RequestBody Message message) {
        log.info("添加系统消息:{}", message);
        try {
            // 系统消息需要发送给所有用户
            messagesService.addSystemMessageToAllUsers(message);
            return Result.success("200", "发送成功");
        } catch (Exception e) {
            log.error("发送系统消息失败", e);
            return Result.error("500", "发送失败：" + e.getMessage());
        }
    }

    /**
     * 标记消息为已读
     * @param id 消息ID
     * @return 更新结果
     */
    @PutMapping("/{id}/read")
    public Result readMessage(@PathVariable("id") Long id) {
        log.info("标记消息已读，消息ID:{}", id);
        try {
            messagesService.markMessageAsRead(id);
            return Result.success("200", "标记已读成功");
        } catch (Exception e) {
            log.error("标记消息已读失败", e);
            return Result.error("500", "标记已读失败：" + e.getMessage());
        }
    }

    /**
     * 发送活动提醒
     * @param activityId 活动ID
     * @return 发送结果
     */
    @PostMapping("/activity/{activityId}")
    public Result sendActivityReminder(@PathVariable("activityId") Long activityId) {
        log.info("发送活动提醒，活动ID:{}", activityId);
        try {
            messagesService.sendActivityReminder(activityId);
            return Result.success("200", "发送活动提醒成功");
        } catch (Exception e) {
            log.error("发送活动提醒失败", e);
            return Result.error("500", "发送活动提醒失败：" + e.getMessage());
        }
    }

    /**
     * 发送服务预约提醒
     * @param appointmentId 预约ID
     * @return 发送结果
     */
    @PostMapping("/service/{appointmentId}")
    public Result sendServiceReminder(@PathVariable("appointmentId") Long appointmentId) {
        log.info("发送服务预约提醒，预约ID:{}", appointmentId);
        try {
            messagesService.sendServiceReminder(appointmentId);
            return Result.success("200", "发送服务提醒成功");
        } catch (Exception e) {
            log.error("发送服务提醒失败", e);
            return Result.error("500", "发送服务提醒失败：" + e.getMessage());
        }
    }
}
