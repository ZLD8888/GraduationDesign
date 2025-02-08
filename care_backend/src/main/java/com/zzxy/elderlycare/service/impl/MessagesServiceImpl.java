package com.zzxy.elderlycare.service.impl;

import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Message;
import com.zzxy.elderlycare.entity.User;
import com.zzxy.elderlycare.entity.Appointments;
import com.zzxy.elderlycare.mapper.MessagesMapper;
import com.zzxy.elderlycare.mapper.UserMapper;
import com.zzxy.elderlycare.service.MessagesService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class MessagesServiceImpl implements MessagesService {
    @Autowired
    private MessagesMapper messagesMapper;
    
    @Autowired
    private UserMapper userMapper;

    @Override
    public void addSystemMessageToAllUsers(Message message) {
        // 获取所有用户
        List<User> allUsers = userMapper.getAllUsers();
        
        // 为每个用户创建一条消息
        for (User user : allUsers) {
            Message userMessage = new Message();
            BeanUtils.copyProperties(message, userMessage);
            userMessage.setReceiverId(Long.valueOf(user.getId()));
            userMessage.setIsRead(false);
            userMessage.setCreateTime(LocalDateTime.now());
            
            messagesMapper.addSystemMessage(userMessage);
        }
    }

    @Override
    public void markMessageAsRead(Long messageId) {
        Message message = messagesMapper.selectById(messageId);
        if (message != null) {
            message.setIsRead(true);
            messagesMapper.updateById(message);
        }
    }
    @Override
    public List<Message> getMessagesByReceiverId(Long receiverId) {
        return messagesMapper.selectByReceiverId(receiverId);
    }

    @Override
    public List<Message> getMessagesByTypeAndReceiverId(String type, Long receiverId) {
        return messagesMapper.selectByTypeAndReceiverId(type, receiverId);
    }


    @Override
    public void sendActivityReminder(Long activityId) {

    }

    @Override
    public void sendServiceReminder(Long appointmentId) {

    }

    /**
     * @param activity 即将开始活动信息
     */
    @Override
    public void sendActivityNotification(Activity activity) {
        //获取参与者id
        List<Long> activityParticipants = messagesMapper.getActivityParticipants(activity.getId());
        // 构建消息对象
        for (Long participantId : activityParticipants) {
            Message message = new Message();
            message.setTitle("活动通知");
            message.setContent("您有一个活动即将开始：" + activity.getName());
            message.setType("ACTIVITY");
            message.setSenderId(1L); // 发送者ID，根据实际情况设置
            message.setRelatedId(Long.valueOf(activity.getId())); // 关联的活动ID
            message.setReceiverId(participantId); // 接收者ID，根据活动信息设置
            message.setIsRead(false);
            message.setCreateTime(LocalDateTime.now());
            messagesMapper.sendActivityNotification(message);
        }

    }

    @Override
    public void sendServiceNotification(Appointments appointment) {
        Message message = new Message();
        message.setTitle("服务预约提醒");
        message.setContent("您预约的服务将在一小时后开始，请准时参加。");
        message.setType("SERVICE");
        message.setSenderId(1L); // 系统发送
        message.setReceiverId(Long.valueOf(appointment.getUserId())); // 预约用户ID
        message.setRelatedId(Long.valueOf(appointment.getServiceId())); // 关联的预约ID
        message.setIsRead(false);
        message.setCreateTime(LocalDateTime.now());
        
        messagesMapper.sendServiceNotification(message);
    }

    @Override
    public boolean hasNotificationBeenSent(String type, Long relatedId) {
        return messagesMapper.countByTypeAndRelatedId(type, relatedId) > 0;
    }

}
