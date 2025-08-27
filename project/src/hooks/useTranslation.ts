import { useState, useEffect } from 'react';
import axios from 'axios';

interface TranslationData {
  common: Record<string, string>;
  navigation: Record<string, string>;
  mentee: Record<string, string>;
  home: Record<string, string>;
  matching: Record<string, string>;
  pricing: Record<string, string>;
  wrongNote: Record<string, string>;
  mentor: Record<string, string>;
}

export const useTranslation = (language: string = 'ko') => {
  const [translations, setTranslations] = useState<TranslationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/translations/${language}`);
        setTranslations(response.data);
      } catch (err) {
        console.error('번역 데이터 로드 실패:', err);
        setError('번역 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [language]);

  const t = (key: string, namespace: keyof TranslationData = 'home') => {
    if (!translations) return key;
    
    const namespaceData = translations[namespace];
    if (!namespaceData) return key;
    
    return namespaceData[key] || key;
  };

  return {
    t,
    translations,
    loading,
    error,
    language
  };
};
