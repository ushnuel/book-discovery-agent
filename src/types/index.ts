export interface Book {
  title: string;
  author: string;
  productUrl: string;
  aiSummary?: string;
  description: string;
  valueScore?: number;
  currentPrice: number;
  originalPrice?: number;
  relevanceScore?: number;
  discountAmount?: number;
  discountPercentage?: number;
}

export interface JobStatus {
  id: string;
  books?: Book[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}
