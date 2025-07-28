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
        	//엘라스틱에서 검색요청에 필요한 객체모음
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                    .aggregation(//집계할때 쓰는 서치소스빌더 하위 함수로
                    		//필드이름이 search_keyword.keyword중 상위10개를 popular_keywords로 지정해서 
                            AggregationBuilders.terms("popular_keywords")
                                    .field("search_keyword.keyword")
                                    .size(10)
                    )
                    .size(0); //문서는 필요없고 집계결과만 가져온다
            //위에 실은내용으로 search-autocomplete라는 인덱스로 보내고
            SearchRequest searchRequest = new SearchRequest("search-autocomplete").source(sourceBuilder);
            //응답은 위에 요청이랑 디폴트 값으로 해서 받겠다
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);
            //Terms 엘라스틱에서 집계결과를 자바에서 쓰기위한 객체 popular_keywords의 집계결과를 응답받음
            Terms terms = response.getAggregations().get("popular_keywords");
            	//같은 값을 모아서 반복문을 돌려서 결과를 문자열로 받음
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
        try {	//실제 es 인덱스랑 로그스태치에 있는 것을 비교해서 
        	QueryBuilder query = QueryBuilders
        		       .matchQuery("search_keyword", prefix);
        		//es결과를 생성하고 위에 fetchSource를 통해 search_keyword 결과 중 최대 10개만 추출
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                    .query(query)
                    .fetchSource("search_keyword", null)
                    .size(10);

            SearchRequest searchRequest = new SearchRequest("search-autocomplete").source(sourceBuilder);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);
            		//배열을 stream통해 변환해서 응답을 받는데 첫번째는 전체검색결과 2번째가 그안에 있는 값이기 때문에 2번씀
            Arrays.stream(response.getHits().getHits())
            		//맵함수 활용해서 search_keyword만 추출
                    .map(hit -> hit.getSourceAsMap().get("search_keyword"))
                    //널 아닌값만 필터
                    .filter(Objects::nonNull)
                    //오브젝트 타입을 문자열 하고 중복제거
                    .map(Object::toString)
                    .distinct()
                    .forEach(results::add);

        } catch (Exception e) {
            log.error("자동완성 실패", e);
        }
        return results;
    }
}
