export interface Source { title: string; publisher: string; url?: string }
export interface EditorialImage { src: string; alt: string; credit: string; creditUrl: string; isAiGenerated?: boolean }
export interface NewsSection { id: string; title: string; paragraphs: string[]; sources: Source[]; image?: EditorialImage; explanation?: { termLabel: string; termDescription: string } }
export interface DailySummary {
  date: string;
  description?: string;
  publishedAt?: string;
  version?: string;
  title: string;
  isExample: boolean;
  readingMinutes: number;
  coverImage?: EditorialImage;
  keyPoints: string[];
  sections: NewsSection[];
  closing: string;
  terms: Record<string, { label: string; description: string; example: string }>;
}
