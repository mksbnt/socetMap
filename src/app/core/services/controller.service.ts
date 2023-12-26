import { Injectable } from '@angular/core';
import { IGroupedSignals, ISignal } from '../interfaces/signal.interface';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ControllerService {
  private _currentTime$ = new BehaviorSubject<number>(0);
  currentTime$ = this._currentTime$
    .asObservable()
    .pipe(filter((value) => value !== 0));

  private _sliderValue = 0;
  public get sliderValue() {
    return this._sliderValue;
  }
  public set sliderValue(value) {
    this._sliderValue = value;
  }
  private _signals: ISignal[] = [];
  get signals(): ISignal[] {
    return this._signals;
  }
  set signals(signals: ISignal[]) {
    this._signals = signals;
  }
  set spreadSignals(signals: ISignal[]) {
    this._signals = [...this.signals, ...signals];
  }
  private _signalsCount = 0;
  get signalsCount(): number {
    return this._signalsCount;
  }
  set signalsCount(value: number) {
    this._signalsCount = value;
  }
  private _groupedSignals: IGroupedSignals = {};
  public get groupedSignals(): IGroupedSignals {
    return this._groupedSignals;
  }
  public set groupedSignals(value: IGroupedSignals) {
    this._groupedSignals = value;
  }

  sliderValueChange(newValue: number) {
    this._currentTime$.next(
      this.getLatestTimestampKey(this.groupedSignals, newValue)
    );
  }

  updateSignals(): void {
    this.groupedSignals = this.groupSignalsByTimestamp(this.signals);
    this.signalsCount = Object.keys(this.groupedSignals).length;
    this.sliderValue = this.signalsCount;
    this._currentTime$.next(
      this.getLatestTimestampKey(this.groupedSignals, this.signalsCount - 1)
    );
  }

  getLatestTimestampKey(
    groupedSignals: IGroupedSignals,
    signalsCount: number
  ): number {
    return +Object.keys(groupedSignals)[signalsCount - 1];
  }

  groupSignalsByTimestamp(signals: ISignal[]): IGroupedSignals {
    return signals.reduce<IGroupedSignals>((grouped, obj) => {
      const timestamp = obj.timestamp;
      grouped[timestamp] = grouped[timestamp] || [];
      grouped[timestamp].push(obj);
      return grouped;
    }, {});
  }

  getSignalsByTimestamp(
    groupedSignals: IGroupedSignals,
    timestamp: number
  ): ISignal[] {
    return groupedSignals[timestamp];
  }
}
