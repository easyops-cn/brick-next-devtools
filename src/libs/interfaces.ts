export interface BrickData {
  uid: number;
  tagName: string;
  properties: Record<string, any>;
}

export interface RichBrickData extends BrickData {
  children: RichBrickData[];
}
