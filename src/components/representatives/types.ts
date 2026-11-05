export interface BillHistory {
  coAuthors?: string;
  firstReading?: string;
  committeeActions?: string;
  secondReading?: string;
  thirdReading?: string;
  presidentialAction?: string;
  fullHistoryText?: string;
}

export interface Bill {
  billNo: string;
  authorshipType: string;
  fullTitle: string;
  dateFiled: string;
  significance: string;
  principalAuthors: string;
  dateRead: string;
  primaryReferral: string;
  billStatus: string;
  pdfUrl: string;
  historyUrl: string;
  history: BillHistory;
}

export interface RepresentativeSummary {
  totalBills: number;
  principalAuthoredCount: number;
  coAuthoredCount: number;
}

export interface RepresentativeData {
  profile: {
    memberId: string;
    name: string;
    districtInfo: string;
    scrapedAt: string;
  };
  summary: RepresentativeSummary;
  bills: Bill[];
}

// Fix lowercase bill filenames in HREP PDF URLs (e.g. hb02994.pdf -> HB02994.pdf) to prevent AWS S3 403 Access Denied errors
export const getNormalizedPdfUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/\/hb(\d+)\.pdf$/i, (_, num) => `/HB${num}.pdf`);
};
