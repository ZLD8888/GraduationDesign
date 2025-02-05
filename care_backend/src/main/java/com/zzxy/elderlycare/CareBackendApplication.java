package com.zzxy.elderlycare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CareBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareBackendApplication.class, args);
    }

}
