export interface ExamResult {
  examType: 'BAC' | 'BEPC' | 'C1AS';
  year: number;
  identifier: string;
  nameFr: string | null;
  nameAr: string | null;
  wilayaFr: string | null;
  wilayaAr: string | null;
  institutionFr: string | null;
  institutionAr: string | null;
  examCenterFr: string | null;
  examCenterAr: string | null;
  seriesCode: string | null;
  seriesFr: string | null;
  seriesAr: string | null;
  score: number | null;
  scoreLabel: string | null;
  decisionCode: string | null;
  decisionLabel: string | null;
  sessionType: 'NORMAL' | 'COMPLEMENTARY' | null;
  publishedAt: string | null;
}
