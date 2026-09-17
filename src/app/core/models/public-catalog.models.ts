export type ExamType = 'BAC' | 'BEPC' | 'C1AS';
export type SessionType = 'NORMAL' | 'COMPLEMENTARY';

export interface ExamSessionView {
  id: number;
  examType: ExamType;
  year: number;
  sessionType: SessionType;
  status: 'PUBLISHED';
  publishedAt: string | null;
  sourceFilename: string | null;
  resultCount: number;
}

export interface ExamAvailability {
  examType: ExamType;
  available: boolean;
  sessions: ExamSessionView[];
}

export interface SearchCriteria {
  sessionType: SessionType;
  examType: ExamType;
  year: number;
  candidateNumber?: string;
  name?: string;
  wilaya?: string;
  series?: string;
  institution?: string;
  page?: number;
  size?: number;
}

export interface SearchResultItem {
  sessionType: SessionType;
  examType: ExamType;
  year: number;
  identifier: string;
  nameFr: string | null;
  nameAr: string | null;
  wilayaFr: string | null;
  wilayaAr: string | null;
  institutionFr: string | null;
  institutionAr: string | null;
  score: number | null;
  decisionCode: string | null;
  decisionLabel: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DistributionItem {
  code: string | null;
  labelFr: string | null;
  labelAr: string | null;
  count: number;
  percentage: number;
}

export interface StatisticsResponse {
  sessionType: SessionType;
  examType: ExamType;
  year: number;
  candidateCount: number;
  admittedCount: number;
  failedCount: number;
  secondSessionCount: number;
  cancelledCount: number;
  averageScore: number | null;
  successRate: number;
  byWilaya: DistributionItem[];
  bySeries: DistributionItem[];
}

export interface InstitutionSummary {
  sessionType: SessionType;
  id: string;
  examType: ExamType;
  year: number;
  nameFr: string | null;
  nameAr: string | null;
  wilayaFr: string | null;
  wilayaAr: string | null;
  candidateCount: number;
  admittedCount: number;
  averageScore: number | null;
  successRate: number;
}

export interface InstitutionDetail {
  summary: InstitutionSummary;
  decisionDistribution: DistributionItem[];
  seriesDistribution: DistributionItem[];
}
