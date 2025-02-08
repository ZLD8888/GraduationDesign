package com.zzxy.elderlycare.mapper;

import com.zzxy.elderlycare.entity.Activity;
import com.zzxy.elderlycare.entity.Message;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessagesMapper {
    @Select("select * from messages")
    List<Message> selectAllList();
    @Select("select * from messages where type = #{type}")
    List<Message> selectList(String type);
    @Insert("insert into " +
            "messages " +
            "(title, content, type, sender_id, receiver_id, related_id, is_read, create_time, update_time) " +
            "values " +
            "(#{title}, #{content}, #{type}, #{senderId}, #{receiverId}, #{relatedId}, #{isRead}, #{createTime}, #{updateTime})")
    void addSystemMessage(Message message);
    @Select("select * from messages where receiver_id = #{receiverId}")
    List<Message> selectByReceiverId(Long receiverId);
    @Select("select * from messages where receiver_id = #{receiverId} and type = #{type}")
    List<Message> selectByTypeAndReceiverId(String type, Long receiverId);

    @Select("select * from messages where id = #{messageId}")
    Message selectById(Long messageId);
    @Update("update messages set is_read = #{isRead} where id = #{id}")
    void updateById(Message message);
    @Insert("insert into messages " +
            "(title, content, type, sender_id, receiver_id, related_id, is_read, create_time, update_time) " +
            "values " +
            "(#{title}, #{content}, #{type}, #{senderId}, #{receiverId}, #{relatedId}, #{isRead}, #{createTime}, #{updateTime})")
    void sendActivityNotification(Message message);
    @Select("select elderly_id from activity_participants where activity_id = #{id}")
    List<Long> getActivityParticipants(Integer id);
    @Select("select id from elderly_info where id_card = #{idCard}")
    Integer getServiceUserId(String idCard);
    @Insert("insert into messages " +
            "(title, content, type, sender_id, receiver_id, related_id, is_read, create_time, update_time) " +
            "values " +
            "(#{title}, #{content}, #{type}, #{senderId}, #{receiverId}, #{relatedId}, #{isRead}, #{createTime}, #{updateTime})")
    void sendServiceNotification(Message message);
    @Select("select * from messages where receiver_id = #{participantId} and related_id = #{id}")
    List<Message> getMessagesByTypeAndRelatedId(Long participantId, Integer id);
    @Select("SELECT COUNT(*) FROM messages WHERE type = #{type} AND related_id = #{relatedId}")
    int countByTypeAndRelatedId(@Param("type") String type, @Param("relatedId") Long relatedId);
}
