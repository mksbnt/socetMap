import { Injectable, inject } from '@angular/core';
import { INewGroupedSignal, ISignal } from '../interfaces/signal.interface';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import {
  BehaviorSubject,
  distinctUntilChanged,
  lastValueFrom,
  tap,
} from 'rxjs';
import { DB_KEYS } from '../enums/db-keys.enum';
import { SignalsService } from './signals.service';
import {
  extractTimestampAndSignals,
  groupSignalsByTimestamp,
  oldSignalsIds,
} from '../utils/signal.util';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);
  private signalsService: SignalsService = inject(SignalsService);
  recordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor() {
    this.setRecordsCount(DB_KEYS.GROUPED_SIGNALS);
  }

  setRecordsCount(key: DB_KEYS): void {
    this.dbService
      .count(key)
      .pipe(distinctUntilChanged())
      .subscribe((count) => {
        this.recordsCount$.next(count);
      });
  }

  get(key: DB_KEYS, timeStamp: number) {
    this.dbService
      .getByIndex<INewGroupedSignal>(key, 'timestamp', timeStamp)

      .subscribe((res) => {
        res
          ? this.signalsService.signals$.next(res.signals)
          : this.signalsService.signals$.next([]);
      });
  }

  write(key: DB_KEYS, data: ISignal[]) {
    const [timestamp, signals] = extractTimestampAndSignals(
      groupSignalsByTimestamp(data)
    );

    this.dbService
      .add(key, { timestamp, signals })
      .pipe(
        tap(() => this.signalsService.signals$.next(signals)),
        tap(() => this.deleteOldSignals(DB_KEYS.GROUPED_SIGNALS, timestamp)),
        tap(() => this.setRecordsCount(DB_KEYS.GROUPED_SIGNALS))
      )
      .subscribe();
  }

  async getAllRecords(key: DB_KEYS): Promise<INewGroupedSignal[]> {
    return lastValueFrom(this.dbService.getAll(key));
  }

  private deleteOldSignals(key: DB_KEYS, currentTimestamp: number): void {
    this.dbService
      .getAll<INewGroupedSignal>(DB_KEYS.GROUPED_SIGNALS)
      .subscribe((res) =>
        this.deleteRecords(key, oldSignalsIds(res, currentTimestamp))
      );
  }

  private bulkDelete(key: DB_KEYS, ids: number[]): void {
    this.dbService.bulkDelete(key, ids).subscribe();
  }

  private deleteRecords(key: DB_KEYS, ids: number[]): void {
    ids.length ? this.bulkDelete(key, ids) : null;
  }
}
