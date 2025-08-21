package com.example.controller;

import com.example.VO.NotificationVO;
import com.example.service.FcmPushService;
import com.example.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramInterval;
import org.elasticsearch.search.aggregations.bucket.histogram.Histogram;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ChatLogAnalysisController {

    private final RestHighLevelClient client;
    private final NotificationService notificationService;
    private final FcmPushService fcmPushService;

    @GetMapping("/spam-stats")
    public List<Map<String, Object>> getSpamActivity() throws IOException {
        SearchRequest searchRequest = new SearchRequest("chat-logs");

        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        sourceBuilder.size(0);
        sourceBuilder.query(QueryBuilders.boolQuery()
            .must(QueryBuilders.termQuery("type", "chat_message"))
            .filter(QueryBuilders.rangeQuery("@timestamp").gte("now-3d"))
        );

        DateHistogramAggregationBuilder dateHistogram = AggregationBuilders
            .dateHistogram("by_minute")
            .field("@timestamp")
            .calendarInterval(DateHistogramInterval.MINUTE)
            .timeZone(ZoneId.of("Asia/Seoul"))
            .minDocCount(1);

        TermsAggregationBuilder bySenderAgg = AggregationBuilders
            .terms("by_sender")
            .field("senderId")
            .minDocCount(1)
            .size(100)
            .subAggregation(
                AggregationBuilders.terms("by_content")
                    .field("content.keyword")
                    .minDocCount(2)
                    .size(100)
            );

        dateHistogram.subAggregation(bySenderAgg);
        sourceBuilder.aggregation(dateHistogram);
        searchRequest.source(sourceBuilder);

        SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

        return parseAndNotifySpam(response);
    }

    // ✅ 여기에 알림 저장 + FCM 발송 로직도 포함
    private List<Map<String, Object>> parseAndNotifySpam(SearchResponse response) {
        List<Map<String, Object>> finalData = new ArrayList<>();

        try {
            Histogram histogram = response.getAggregations().get("by_minute");

            for (Histogram.Bucket timeBucket : histogram.getBuckets()) {
                String time = timeBucket.getKeyAsString();
                Terms senderAgg = timeBucket.getAggregations().get("by_sender");

                for (Terms.Bucket senderBucket : senderAgg.getBuckets()) {
                    Terms contentAgg = senderBucket.getAggregations().get("by_content");

                    for (Terms.Bucket contentBucket : contentAgg.getBuckets()) {
                        long count = contentBucket.getDocCount();

                        String senderIdStr = senderBucket.getKeyAsString();
                        String content = contentBucket.getKeyAsString();
                        Integer senderId = Integer.parseInt(senderIdStr);

                        Map<String, Object> entry = new HashMap<>();
                        entry.put("time", time);
                        entry.put("sender", senderIdStr);
                        entry.put("message", content);
                        entry.put("count", count);
                        finalData.add(entry);

                        // ✅ DB 저장
                        NotificationVO noti = new NotificationVO();
                        noti.setUserId(senderId);
                        noti.setMessage("[스팸 감지] " + content + " (시간: " + time + ")");
                        noti.setCreatedAt(LocalDateTime.now());
                        noti.setRead(false);
                        notificationService.insertNotification(noti);

                        // ✅ FCM 푸시 발송
                        fcmPushService.sendPushToUser(senderId, noti.getMessage());

                        System.out.printf("📌 시간: %s | 사용자: %s | 메시지: \"%s\" | 반복: %d회\n",
                            time, senderIdStr, content, count);
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("❌ 스팸 응답 파싱 중 오류 발생: " + e.getMessage());
        }

        return finalData;
    }
}
