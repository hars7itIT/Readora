export interface FeedAggregate {
  _id: string; // Normalized feed URL
  count: number;
  title: string;
  updatedAt: Date;
}
