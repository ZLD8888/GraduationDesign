package com.zzxy.elderlycare.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey key;

    @PostConstruct
    public void init() {
        // 使用 Keys.secretKeyFor 生成安全的密钥
        this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }

    public String generateToken(String phone) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(phone)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getPhoneFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * 验证JWT令牌的有效性。
     *
     * @param token 要验证的JWT令牌
     * @return 如果令牌有效则返回true，否则返回false
     */
    public boolean validateToken(String token) {
        try {
            // 使用Jwts.parserBuilder()创建一个JWT解析器构建器
            // 设置签名密钥为之前生成的密钥
            // 构建解析器并解析传入的JWT令牌
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            // 如果解析成功，说明令牌有效，返回true
            return true;
        } catch (Exception e) {
            // 如果解析过程中发生异常，说明令牌无效，返回false
            return false;
        }
    }

}
