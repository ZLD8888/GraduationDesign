package com.zzxy.elderlycare.entity;

import lombok.Data;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;

@Data
public class User {
    private Integer id;
    private String phone;
    private String password;
    private String name;
    private String role;
    private String wxOpenid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
