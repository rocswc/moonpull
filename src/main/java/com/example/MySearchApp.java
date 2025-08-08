package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  //스케줄링 작동을 위해 추가
public class MySearchApp {
    public static void main(String[] args) {
        SpringApplication.run(MySearchApp.class, args);
    }
}