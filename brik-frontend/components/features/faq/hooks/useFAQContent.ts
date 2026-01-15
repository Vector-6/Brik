'use client';

import { useMemo, useState } from "react";
import { faqSections, faqTopics } from "../data/faqs";
import type { FAQSection, FAQTopic } from "../types";

const normalize = (value: string) => value.toLowerCase().trim();

const includesQuery = (content: string, query: string) =>
  normalize(content).includes(query);

const matchTags = (tags: string[] | undefined, query: string) => {
  if (!tags || tags.length === 0 || !query) return false;
  return tags.some((tag) => normalize(tag).includes(query));
};

interface UseFAQContentOptions {
  defaultTopicId?: string;
}

interface UseFAQContentResult {
  topics: FAQTopic[];
  sections: FAQSection[];
  searchValue: string;
  activeTopicId: string;
  setSearchValue: (value: string) => void;
  setActiveTopicId: (topicId: string) => void;
  totalMatches: number;
  hasResults: boolean;
  resetFilters: () => void;
}

export function useFAQContent({
  defaultTopicId = "all",
}: UseFAQContentOptions = {}): UseFAQContentResult {
  const [searchValue, setSearchValue] = useState("");
  const [activeTopicId, setActiveTopicId] = useState(defaultTopicId);

  const query = normalize(searchValue);
  const filteredSections = useMemo(() => {
    const shouldFilterByTopic = activeTopicId !== "all";

    return faqSections
      .filter((section) =>
        shouldFilterByTopic ? section.categoryId === activeTopicId : true,
      )
      .map((section) => {
        const items = section.items.filter((item) => {
          if (!query) return true;

          return (
            includesQuery(item.question, query) ||
            includesQuery(item.answer, query) ||
            matchTags(item.tags, query)
          );
        });

        return { ...section, items } satisfies FAQSection;
      })
      .filter((section) => section.items.length > 0);
  }, [activeTopicId, query]);

  const totalMatches = filteredSections.reduce(
    (acc, section) => acc + section.items.length,
    0,
  );

  const resetFilters = () => {
    setSearchValue("");
    setActiveTopicId("all");
  };

  return {
    topics: faqTopics,
    sections: filteredSections,
    searchValue,
    activeTopicId,
    setSearchValue,
    setActiveTopicId,
    totalMatches,
    hasResults: totalMatches > 0,
    resetFilters,
  };
}
