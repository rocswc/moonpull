// src/store/useKeywordStore.ts
import { create } from "zustand";
import axios from "axios";

interface KeywordStore {
  trendingKeywords: string[];
  setTrendingKeywords: (keywords: string[]) => void;
  fetchTrending: () => void; // ✅ 추가
}

export const useKeywordStore = create<KeywordStore>((set) => ({
  trendingKeywords: [],
  setTrendingKeywords: (keywords) => set({ trendingKeywords: keywords }),
  fetchTrending: async () => {
    try {
      const res = await axios.get("/api/keywords/trending");
      set({ trendingKeywords: res.data });
    } catch (e) {
      console.error("인기 검색어 불러오기 실패", e);
    }
  },
}));
