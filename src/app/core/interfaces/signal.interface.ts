export interface IPoint {
  lat: number;
  lon: number;
}

export interface ISignal {
  id?: number;
  timestamp: number;
  frequency: number;
  point: IPoint;
  zone: IPoint[] | [];
}

export interface IGroupedSignals {
  [timestamp: number]: ISignal[];
}
