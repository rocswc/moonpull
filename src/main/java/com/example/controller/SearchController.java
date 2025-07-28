package com.example.controller;

import com.example.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/api/keywords/trending")
    public List<String> getTrendingKeywords() {
        return searchService.getPopularKeywords();
    }

    @GetMapping("/api/keywords/autocomplete")
    public List<String> getAutocomplete(@RequestParam("q") String keyword) {
        return searchService.getAutocomplete(keyword);
    }

    @GetMapping("/api/search")	//q라는 값이 url에 받음
    public List<String> search(@RequestParam("q") String query) {
       //서비스에서 받아온걸 매개변수 커리를 주입
        searchService.logSearchKeyword(query);

        // 검색 결과 반환 (자동완성 기반)
        return searchService.getAutocomplete(query);
    }
}
