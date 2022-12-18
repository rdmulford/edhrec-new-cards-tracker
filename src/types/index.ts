export type AppConfig = {
  commanders: Commander[];
};

export type Commander = {
  name: string;
  theme?: string;
};

export type NewCardMap = Map<Commander, string[]>;

export type TrackingResults = {
  timestamp: Date;
  cards: NewCardMap;
};
