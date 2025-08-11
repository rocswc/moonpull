package com.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.*;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.collapse.CollapseBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class SearchService {

    @Autowired
    private RestHighLevelClient client;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public void logSearchKeyword(String keyword) {
        try {
            Map<String, Object> logMap = new HashMap<>();
            logMap.put("search_keyword", keyword);
            logMap.put("timestamp", new Date());
            String json = objectMapper.writeValueAsString(logMap);
            log.info(json);
        } catch (Exception e) {
            log.warn("검색어 로그 기록 실패", e);
        }
    }

    public List<String> getPopularKeywords() {
        List<String> results = new ArrayList<>();
        try {
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                    .aggregation(AggregationBuilders.terms("popular_keywords")
                            .field("search_keyword.keyword")
                            .size(10))
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
            String q = prefix == null ? "" : prefix.trim();
            if (q.isEmpty()) return results;

            // .keyword prefix용 전처리 (구두점 제거 + 소문자)
            String cleanedForKeyword = q.replaceAll("\\p{Punct}", "").toLowerCase();

            // 1) n-gram 기반 일반 매치
            MatchQueryBuilder match = QueryBuilders.matchQuery("search_keyword", q);

            // 2) 구문 접두 강화
            MatchPhrasePrefixQueryBuilder mpp =
                    QueryBuilders.matchPhrasePrefixQuery("search_keyword", q).boost(1.5f);

            // 3) 정확 접두(정렬/품질 보정)
            PrefixQueryBuilder keywordPrefix =
                    QueryBuilders.prefixQuery("search_keyword.keyword", cleanedForKeyword).boost(2.0f);

            BoolQueryBuilder bool = QueryBuilders.boolQuery()
                    .should(match)
                    .should(mpp)
                    .should(keywordPrefix)
                    .minimumShouldMatch(1);

            SearchSourceBuilder sb = new SearchSourceBuilder()
                    .query(bool)
                    .fetchSource(new String[]{"search_keyword"}, null)
                    // 같은 제안어 중복 제거
                    .collapse(new CollapseBuilder("search_keyword.keyword"))
                    .sort("_score", SortOrder.DESC)
                    .size(10);

            SearchRequest req = new SearchRequest("search-autocomplete").source(sb);
            SearchResponse res = client.search(req, RequestOptions.DEFAULT);

            Arrays.stream(res.getHits().getHits())
                    .map(h -> h.getSourceAsMap().get("search_keyword"))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .forEach(results::add);

        } catch (Exception e) {
            log.error("자동완성 실패", e);
        }
        return results;
    }
}
