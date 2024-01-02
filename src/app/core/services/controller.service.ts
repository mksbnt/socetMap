import { Injectable, inject } from '@angular/core';
import { IGroupedSignals, ISignal } from '../interfaces/signal.interface';
import { BehaviorSubject, filter } from 'rxjs';
import { TimeService } from './time.service';

@Injectable({
  providedIn: 'root',
})
export class ControllerService {
  private timeService: TimeService = inject(TimeService);

  private _currentTime$ = new BehaviorSubject<number>(
    this.timeService.currentTimestampMilliseconds
  );

  currentTime$ = this._currentTime$
    .asObservable()
    .pipe(filter((value) => value !== 0));

  setCurrentTime(currentTimeMillis: number) {
    if (currentTimeMillis !== this._currentTime$.value) {
      this._currentTime$.next(currentTimeMillis);
    }
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

  transformSignals(signals: ISignal[]): any {
    return signals.map((signal) => ({
      timestamp: signal.timestamp,
      frequency: signal.frequency,
      signals: {
        point: signal.point,
        zone: signal.zone,
      },
    }));
  }

  getSignalsByTimestamp(
    // todo: memoizationsliderValueChange
    groupedSignals: IGroupedSignals,
    timestamp: number
  ): ISignal[] {
    return groupedSignals[timestamp];
  }
}
