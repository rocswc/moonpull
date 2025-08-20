package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

//생성시각을 자동 기록
@Configuration
@EnableMongoAuditing
public class MongoAuditingConfig {

}
