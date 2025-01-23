package com.zzxy.elderlycare.dto;

import lombok.Data;

@Data
public class UserLoginDto {
    private String phone;
    private String password;

    public String getPhone() {
        return phone;
    }

    public String getPassword() {
        return password;
    }
}
