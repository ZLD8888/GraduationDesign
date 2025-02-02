package com.zzxy.elderlycare.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.expiration}")
    private long expiration;

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey key;

    @PostConstruct
    public void init() {
        try {
            // 确保密钥长度至少为256位（32字节）
            byte[] keyBytes = new byte[32];
            byte[] secretBytes = secret.getBytes();
            // 如果密钥不够长，进行填充
            System.arraycopy(secretBytes, 0, keyBytes, 0, Math.min(secretBytes.length, keyBytes.length));
            
            // 使用SHA-256生成安全的密钥
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            keyBytes = sha.digest(keyBytes);
            this.key = Keys.hmacShaKeyFor(keyBytes);
            
            logger.info("JWT secret key initialized successfully with SHA-256");
        } catch (NoSuchAlgorithmException e) {
            logger.error("Error initializing JWT secret key", e);
            // 如果SHA-256不可用，使用安全的随机密钥
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            logger.info("Fallback: JWT secret key initialized with random key");
        }
    }

    public String generateToken(String phone) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        logger.info("Generating token for phone: {}", phone);
        logger.info("Token expiration: {}", expiryDate);

        String token = Jwts.builder()
                .setSubject(phone)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();

        logger.debug("Generated token: {}", token);
        return token;
    }

    public String getPhoneFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String phone = claims.getSubject();
            logger.debug("Extracted phone from token: {}", phone);
            return phone;
        } catch (Exception e) {
            logger.error("Error extracting phone from token", e);
            return null;
        }
    }

    /**
     * 验证JWT令牌的有效性。
     *
     * @param token 要验证的JWT令牌
     * @return 如果令牌有效则返回true，否则返回false
     */
    public boolean validateToken(String token) {
        try {
            logger.debug("Validating token: {}", token);
            
            if (token == null || token.trim().isEmpty()) {
                logger.error("Token is null or empty");
                return false;
            }

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 检查token是否过期
            Date expiration = claims.getExpiration();
            boolean isExpired = expiration.before(new Date());
            
            if (isExpired) {
                logger.error("Token is expired. Expiration: {}, Current time: {}", 
                    expiration, new Date());
                return false;
            }

            // 检查必要的claim
            String phone = claims.getSubject();
            if (phone == null || phone.trim().isEmpty()) {
                logger.error("Token subject (phone) is missing or empty");
                return false;
            }

            logger.info("Token validation successful for phone: {}", phone);
            return true;
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            return false;
        }
    }

}
