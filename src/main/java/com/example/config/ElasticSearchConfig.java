package com.example.config;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.conn.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLContext;
import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;

@Configuration
public class ElasticSearchConfig {

    @Bean
    public RestHighLevelClient elasticsearchClient() throws Exception {

        // 1. 인증 정보 설정
        final BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials("elastic", "votmdnjem")
        );

        KeyStore truststore = KeyStore.getInstance("PKCS12");
        try (FileInputStream is = new FileInputStream("C:/Users/user/git/moonpull/key/ca.p12")) {
            truststore.load(is, "votmdnjem".toCharArray());
        }

        SSLContext sslContext = SSLContexts.custom()
                .loadTrustMaterial(truststore, new TrustSelfSignedStrategy())
                .build();
        // 3. Elasticsearch 클라이언트 빌더
        RestClientBuilder builder = RestClient.builder(
                new HttpHost("34.64.151.197", 9200, "https"), // node-1
                new HttpHost("34.64.215.144", 9200, "https"), // node-2
                new HttpHost("34.64.84.23", 9200, "https")    // node-3
        ).setHttpClientConfigCallback(new RestClientBuilder.HttpClientConfigCallback() {
            @Override
            public HttpAsyncClientBuilder customizeHttpClient(HttpAsyncClientBuilder httpClientBuilder) {
                return httpClientBuilder
                        .setSSLContext(sslContext)
                        .setDefaultCredentialsProvider(credentialsProvider);
            }
        });

        return new RestHighLevelClient(builder);
    }
}
