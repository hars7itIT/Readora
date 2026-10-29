export interface CoSubscription {
  _id: string; // `${a}::${b}` where a < b
  a: string;
  b: string;
  count: number;
  updatedAt: Date;
}
