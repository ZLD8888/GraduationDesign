package com.zzxy.elderlycare.config;

import com.zzxy.elderlycare.service.UserSersive;
import com.zzxy.elderlycare.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserSersive userService;

    @Bean
    public MyWebSocketHandler webSocketHandler() {
        return new MyWebSocketHandler();
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler(), "/ws-health")
                .addInterceptors(new WebSocketInterceptor())
                .setAllowedOrigins("*");
    }

    private class WebSocketInterceptor implements HandshakeInterceptor {
        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                     WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
            try {
                String query = request.getURI().getQuery();
                if (query == null) {
                    log.error("URL参数为空");
                    return false;
                }

                Map<String, String> params = parseQueryString(query);
                String token = params.get("token");
                String userId = params.get("userId");

                if (token == null || userId == null) {
                    log.error("参数缺失: token或userId为空");
                    return false;
                }

                // 验证token
                if (!jwtUtil.validateToken(token)) {
                    log.error("Token验证失败");
                    return false;
                }

                // 将elderlyId存储在WebSocket session的属性中
                attributes.put("elderlyId", userId);
                log.info("WebSocket握手成功，用户ID: {}", userId);
                return true;

            } catch (Exception e) {
                log.error("WebSocket握手异常", e);
                return false;
            }
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                 WebSocketHandler wsHandler, Exception exception) {
        }

        private Map<String, String> parseQueryString(String query) {
            Map<String, String> params = new HashMap<>();
            if (query != null) {
                String[] pairs = query.split("&");
                for (String pair : pairs) {
                    String[] keyValue = pair.split("=");
                    if (keyValue.length == 2) {
                        params.put(keyValue[0], keyValue[1]);
                    }
                }
            }
            return params;
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        return Arrays.stream(query.split("&"))
                .map(param -> param.split("=", 2))
                .filter(arr -> arr.length == 2)
                .collect(Collectors.toMap(
                        arr -> URLDecoder.decode(arr[0], StandardCharsets.UTF_8),
                        arr -> URLDecoder.decode(arr[1], StandardCharsets.UTF_8),
                        (v1, v2) -> v1
                ));
    }
}