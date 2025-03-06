package com.zzxy.elderlycare.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zzxy.elderlycare.event.HealthDataEvent;
import com.zzxy.elderlycare.service.HealthDataService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import jakarta.annotation.PostConstruct;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class MyWebSocketHandler extends TextWebSocketHandler {
    
    private static final Logger log = LoggerFactory.getLogger(MyWebSocketHandler.class);
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Autowired
    private HealthDataService healthDataService;

    public MyWebSocketHandler() {
        this.objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @PostConstruct
    public void init() {
        log.info("WebSocket处理器初始化完成");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String elderlyId = session.getAttributes().get("elderlyId").toString();
        sessions.put(elderlyId, session);
        
        // 发送认证成功消息
        session.sendMessage(new TextMessage("{\"type\":\"AUTH_SUCCESS\"}"));
        log.info("WebSocket连接建立: elderlyId={}", elderlyId);

        // 触发获取最新数据
        healthDataService.getLatestHealthData(Long.parseLong(elderlyId));
    }

    @EventListener
    public void handleHealthDataEvent(HealthDataEvent event) {
        sendMessageToUser(event.getElderlyId(), event.getData());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        String elderlyId = session.getAttributes().get("elderlyId").toString();
        log.info("收到来自老人{}的消息: {}", elderlyId, payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String elderlyId = session.getAttributes().get("elderlyId").toString();
        sessions.remove(elderlyId);
        log.info("WebSocket连接关闭: elderlyId={}, status={}", elderlyId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String elderlyId = session.getAttributes().get("elderlyId").toString();
        log.error("WebSocket传输错误: elderlyId={}", elderlyId, exception);
        sessions.remove(elderlyId);
        session.close(CloseStatus.SERVER_ERROR);
    }

    public void sendMessageToUser(String elderlyId, Object message) {
        WebSocketSession session = sessions.get(elderlyId);
        if (session != null && session.isOpen()) {
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);
                log.debug("发送消息到用户{}: {}", elderlyId, jsonMessage);
                session.sendMessage(new TextMessage(jsonMessage));
            } catch (Exception e) {
                log.error("发送消息到老人" + elderlyId + "失败", e);
            }
        } else {
            log.warn("用户{}的WebSocket会话不存在或已关闭", elderlyId);
        }
    }
}
