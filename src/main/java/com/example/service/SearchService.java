package com.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.elasticsearch.index.query.QueryBuilder;

import java.util.*;

@Slf4j //log 생성 어노테이션 
@Service
public class SearchService {

    @Autowired
    private RestHighLevelClient client; //자바에서 http로 엘라스틱에 요청하기 위해 선언

    private static final ObjectMapper objectMapper = new ObjectMapper(); //제이슨으로 형식을 불러오기 위해 선언 싱글톤패턴

  
    public void logSearchKeyword(String keyword) {
        try {
        	// 앞에는 무조건 문자열이지만 뒤에는 날짜나 숫자가 올 수 있어서 오브젝트로 선언
            Map<String, Object> logMap = new HashMap<>();
            logMap.put("search_keyword", keyword); //검색어
            logMap.put("timestamp", new Date()); // 시간

            String json = objectMapper.writeValueAsString(logMap); // 위에서 맵에서 담은 걸 제이슨 형식으로 변환 후 전송
            log.info(json);
        } catch (Exception e) {
            log.warn("검색어 로그 기록 실패", e);
        }
    }

    public List<String> getPopularKeywords() {
        List<String> results = new ArrayList<>();
        try {
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                    .aggregation(
                            AggregationBuilders.terms("popular_keywords")
                                    .field("search_keyword.keyword")
                                    .size(10)
                    )
                    .size(0);

            SearchRequest searchRequest = new SearchRequest("search-autocomplete").source(sourceBuilder);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);
            Terms terms = response.getAggregations().get("popular_keywords");

            for (Terms.Bucket bucket : terms.getBuckets()) {
                results.add(bucket.getKeyAsString());
            }
        } catch (Exception e) {
            log.error("인기 검색어 가져오기 실패", e);
        }
        return results;
    }

    public List<String> getAutocomplete(String prefix) {
        List<String> results = new ArrayList<>();
        try {
        	QueryBuilder query = QueryBuilders
        		       .matchQuery("search_keyword", prefix);

            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                    .query(query)
                    .fetchSource("search_keyword", null)
                    .size(10);

            SearchRequest searchRequest = new SearchRequest("search-autocomplete").source(sourceBuilder);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            Arrays.stream(response.getHits().getHits())
                    .map(hit -> hit.getSourceAsMap().get("search_keyword"))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .distinct()
                    .forEach(results::add);

        } catch (Exception e) {
            log.error("자동완성 실패", e);
        }
        return results;
    }
}
