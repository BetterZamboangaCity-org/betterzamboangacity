export interface ArticleSection {
  title: string;
  eli5_explanation: string;
}

export interface FinePenalty {
  offense_level: string;
  penalty: string;
}

export interface Ordinance {
  id?: string;
  ordinance_year: number | string;
  ordinance_number: string;
  official_title: string;
  authors: string[];
  co_authors?: string[];
  "co-authors"?: string[];
  presiding_officer?: string | null;
  mayor?: string | null;
  date_enacted?: string | null;
  date_attested?: string | null;
  attested_by?: string | null;
  date_approved?: string | null;
  articles_and_sections: ArticleSection[];
  fines: FinePenalty[];
  active_status?: 'Active' | 'Amended' | 'Repealed' | string;
  eli5_summary: string;
  target_audience?: string[];
  search_keywords?: string[];
  categories?: string[];
  governing_agency?: string | null;
  confidence_score?: number;
  pdf_url?: string | null;
  amendment_details?: any[] | null;
  amended_by_details?: any[] | null;
  created_at?: string;
  updated_at?: string;
}
