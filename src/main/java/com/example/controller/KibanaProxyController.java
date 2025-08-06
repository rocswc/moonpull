package com.example.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@RestController
@RequestMapping("/api/kibana")
public class KibanaProxyController {

    @GetMapping("/dashboard")
    public ResponseEntity<byte[]> getDashboard() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth("gs05047", "worjs12"); // 👈 너의 Kibana 사용자 정보
        headers.setAccept(Collections.singletonList(MediaType.TEXT_HTML));

        HttpEntity<String> entity = new HttpEntity<>(headers);

        String kibanaUrl = "http://34.64.84.23:5601/app/dashboards#/view/146b54d0-6e9b-11f0-8974-0f80ea460176?embed=true";

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                kibanaUrl,
                HttpMethod.GET,
                entity,
                byte[].class
            );

            return ResponseEntity
                    .status(response.getStatusCode())
                    .contentType(MediaType.TEXT_HTML)
                    .body(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(("Error: " + e.getMessage()).getBytes());
        }
    }
}
