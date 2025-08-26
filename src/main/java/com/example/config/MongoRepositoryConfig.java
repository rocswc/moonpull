package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.example.DAO.ChatMessageDocRepo;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
@EnableMongoRepositories(
    basePackageClasses = ChatMessageDocRepo.class,
    mongoTemplateRef = "mongoTemplate"
)
public class MongoRepositoryConfig {

	 @Bean
	    public MongoClient mongoClient() {
	        return MongoClients.create("mongodb://192.168.0.44:27017");
	    }
	
	

	   
	 
	
    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDbFactory, MongoConverter converter) {
        return new MongoTemplate(mongoDbFactory, converter);
    }
}

