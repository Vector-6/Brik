export interface FAQTopic {
  id: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  categoryId: string;
  updatedAt?: string;
  relatedLinks?: Array<{
    label: string;
    href: string;
  }>;
}

export interface FAQSection {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  items: FAQItem[];
  highlight?: string;
}
