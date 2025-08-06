package com.example.controller;

import java.io.IOException;
import java.time.ZoneId;
import java.util.*;

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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ChatLogAnalysisController {

    private final RestHighLevelClient client;

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
        	    .calendarInterval(DateHistogramInterval.MINUTE)  // 시간 → 분 단위로 변경
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
                    .minDocCount(2) // 반복 메시지만
                    .size(100)
            );

        dateHistogram.subAggregation(bySenderAgg);
        sourceBuilder.aggregation(dateHistogram);
        searchRequest.source(sourceBuilder);

        SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);
        System.out.println("✅ Elasticsearch 응답 원본:\n" + response); // 콘솔 출력
        return parseSpamResponse(response);
    }

    private List<Map<String, Object>> parseSpamResponse(SearchResponse response) {
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

                        Map<String, Object> entry = new HashMap<>();
                        entry.put("time", time);
                        entry.put("sender", senderBucket.getKeyAsString());
                        entry.put("message", contentBucket.getKeyAsString());
                        entry.put("count", count);
                        finalData.add(entry);

                        // 🔍 콘솔 출d력
                        System.out.printf("📌 시간: %s | 사용자: %s | 메시지: \"%s\" | 반복횟수: %d회\n",
                                time,
                                senderBucket.getKeyAsString(),
                                contentBucket.getKeyAsString(),
                                count);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ 스팸 응답 파싱 중 오류 발생: " + e.getMessage());
        }

        return finalData;
    }

}
