package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Message;
import com.zzxy.elderlycare.entity.Appointments;

import java.util.List;

public interface MessagesService {

    List<Message> getMessagesByReceiverId(Long receiverId);
    
    List<Message> getMessagesByTypeAndReceiverId(String type, Long receiverId);
    
    void addSystemMessageToAllUsers(Message message);
    
    void markMessageAsRead(Long messageId);
    
    void sendActivityReminder(Long activityId);
    
    void sendServiceReminder(Long appointmentId);

    void sendActivityNotification(Activity activity);

    void sendServiceNotification(Appointments appointment);

    // 检查是否已经发送过通知
    boolean hasNotificationBeenSent(String type, Long relatedId);
}
