package com.zzxy.elderlycare.dto;

import lombok.Data;

@Data
public class RegisterDto {
    private String phone;
    private String password;
    private String name;
    private String role;
}
