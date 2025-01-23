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
        // 从请求中提取JWT令牌
        String token = extractToken(request);
        // 如果令牌存在且有效
        if (token != null && jwtUtil.validateToken(token)) {
            // 从令牌中提取手机号
            String phone = jwtUtil.getPhoneFromToken(token);
            // 如果手机号存在
            if (phone != null) {
                logger.info("手机号:{}",phone);
                try {
                    logger.info("尝试加载用户: {}", phone);
                    // 使用手机号加载用户详情
                    UserDetails userDetails = userDetailsService.loadUserByUsername(phone);
                    // 如果用户详情存在
                    if (userDetails != null) {
                        // 创建一个新的认证令牌，包含用户详情、凭证（这里为null）和权限
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        // 设置认证令牌的详细信息，包括IP地址、会话ID等
                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        // 将认证令牌设置到安全上下文中
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (UsernameNotFoundException e) {
                    logger.error("用户未找到: {}", phone);
                    // 可以选择返回401 Unauthorized 或其他处理
                }
            }
        }

        // 将请求传递到下一个过滤器
        filterChain.doFilter(request, response);
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

        // 检查Authorization字段是否存在且以"Bearer "开头
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // 去除"Bearer "前缀，返回剩余的令牌部分
            return bearerToken.substring(7);
        }

        // 如果没有找到有效的令牌，返回null
        return null;
    }

}
