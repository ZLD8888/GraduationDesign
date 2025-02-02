package com.zzxy.elderlycare.security;

import com.zzxy.elderlycare.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
//@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private JwtUtil jwtUtil;
    private UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);


    @Autowired
    public JwtAuthenticationFilter(UserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 自定义JWT认证过滤器，用于验证JWT令牌并设置用户的认证信息。
     *
     * @param request 当前的HTTP请求
     * @param response 当前的HTTP响应
     * @param filterChain 过滤器链，用于传递请求到下一个过滤器
     * @throws ServletException 如果在处理请求时发生Servlet异常
     * @throws IOException 如果在处理请求时发生I/O异常
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 从请求中提取JWT令牌
            String token = extractToken(request);
            logger.info("Received token: {}", token != null ? "present" : "null");
            
            if (token != null) {
                logger.info("Validating token...");
                if (jwtUtil.validateToken(token)) {
                    String phone = jwtUtil.getPhoneFromToken(token);
                    logger.info("Token validated, phone: {}", phone);
                    
                    if (phone != null) {
                        try {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(phone);
                            if (userDetails != null) {
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(
                                                userDetails,
                                                null,
                                                userDetails.getAuthorities()
                                        );
                                authentication.setDetails(
                                        new WebAuthenticationDetailsSource().buildDetails(request)
                                );
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                logger.info("Successfully set authentication in SecurityContext");
                            } else {
                                logger.error("UserDetails is null for phone: {}", phone);
                            }
                        } catch (UsernameNotFoundException e) {
                            logger.error("User not found: {}", phone, e);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("User not found");
                            return;
                        }
                    } else {
                        logger.error("Phone number is null in token");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Invalid token: no phone number");
                        return;
                    }
                } else {
                    logger.error("Token validation failed");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid token");
                    return;
                }
            } else {
                logger.debug("No token found in request");
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Error processing JWT token", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Error processing token: " + e.getMessage());
        }
    }


    /**
     * 从HTTP请求中提取JWT令牌。
     *
     * @param request HTTP请求对象
     * @return 提取到的JWT令牌，如果没有则返回null
     */
    private String extractToken(HttpServletRequest request) {
        // 从请求头中获取Authorization字段的值
        String bearerToken = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", bearerToken);

        // 检查Authorization字段是否存在且以"Bearer "开头
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // 去除"Bearer "前缀，返回剩余的令牌部分
            String token = bearerToken.substring(7);
            logger.debug("Extracted token: {}", token);
            return token;
        }

        logger.debug("No Bearer token found");
        return null;
    }

}
