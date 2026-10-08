export interface Source { title: string; publisher: string; url?: string }
export interface NewsSection { id: string; title: string; paragraphs: string[]; sources: Source[] }
export interface DailySummary {
  date: string;
  title: string;
  isExample: boolean;
  readingMinutes: number;
  keyPoints: string[];
  sections: NewsSection[];
  closing: string;
  terms: Record<string, { label: string; description: string; example: string }>;
}
