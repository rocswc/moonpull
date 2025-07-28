import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultPage = () => {
  const query = useQuery().get("query") || "";
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        console.log("검색 응답:", res.data);

        const data = res.data;

        if (Array.isArray(data)) {
          setResult(data);
        } else if (Array.isArray(data?.results)) {
          setResult(data.results);
        } else {
          console.warn("예상치 못한 검색 응답 형식:", data);
          setResult([]);
        }
      } catch (e) {
        console.error("검색 오류:", e);
        setResult([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 검색 결과: “{query}”</h1>

      {loading ? (
        <p>로딩 중...</p>
      ) : result.length > 0 ? (
        <ul className="space-y-6">
          {result.map((item, idx) => (
            <li key={idx} className="border p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-primary">{item}</h2>
              <p className="text-sm text-gray-600 mt-2">
                자동완성 추천 키워드입니다.
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      )}
    </div>
  );
};

export default SearchResultPage;
