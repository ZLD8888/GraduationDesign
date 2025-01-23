package com.zzxy.elderlycare.exception;

import lombok.Data;

@Data
public class ServiceException extends RuntimeException{

    private String code;
    private String message;
    public ServiceException(String code ,String message) {
        this.code = code;
        this.message = message;
    }
}
