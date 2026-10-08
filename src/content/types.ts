export interface Source { title: string; publisher: string; url?: string }
export interface EditorialImage { src: string; alt: string; credit: string; creditUrl: string }
export interface NewsSection { id: string; title: string; paragraphs: string[]; sources: Source[]; image?: EditorialImage }
export interface DailySummary {
  date: string;
  title: string;
  isExample: boolean;
  readingMinutes: number;
  coverImage?: EditorialImage;
  keyPoints: string[];
  sections: NewsSection[];
  closing: string;
  terms: Record<string, { label: string; description: string; example: string }>;
}
