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

  get(key: DB_KEYS, timestamp: number) {
    this.dbService
      .getByIndex<INewGroupedSignal>(key, 'timestamp', timestamp)
      .subscribe((response) => this.handleGetResponse(response));
  }

  private handleGetResponse(response: INewGroupedSignal | undefined): void {
    response
      ? this.setSignal(response.signals)
      : this.signalsService.signals$.next([]);
  }

  smth() {}

  private setSignal(signals: ISignal[]): void {
    this.signalsService.signals$.next(signals);

    const currentTimestamp =
      signals.length > 0 ? signals[0].timestamp : undefined;

    this.getAllRecords(DB_KEYS.GROUPED_SIGNALS).then((allSignals) => {
      const currentIndex = allSignals.findIndex(
        (signal) => signal.timestamp === currentTimestamp
      );

      this.updatePreviousAndNextTimestamps(currentIndex, allSignals);
    });
  }

  private updatePreviousAndNextTimestamps(
    currentIndex: number,
    allSignals: INewGroupedSignal[]
  ): void {
    const setPreviousTimestamp = (index: number): void => {
      this.signalsService.previousSignalsTimestamp$.next(
        index !== -1 && index > 0 ? allSignals[index - 1].timestamp : null
      );
    };

    const setNextTimestamp = (index: number): void => {
      this.signalsService.nextSignalsTimestamp$.next(
        index !== -1 && index < allSignals.length - 1
          ? allSignals[index + 1].timestamp
          : null
      );
    };

    setPreviousTimestamp(currentIndex);
    setNextTimestamp(currentIndex);
  }

  write(key: DB_KEYS, data: ISignal[]) {
    const [timestamp, signals] = extractTimestampAndSignals(
      groupSignalsByTimestamp(data)
    );

    this.dbService
      .add(key, { timestamp, signals })
      .pipe(
        tap(() =>
          this.onWriteHandler(timestamp, signals, DB_KEYS.GROUPED_SIGNALS)
        )
      )
      .subscribe();
  }

  private onWriteHandler(
    timestamp: number,
    signals: ISignal[],
    dbKey: DB_KEYS
  ): void {
    this.deleteOldSignals(dbKey, timestamp);
    this.signalsService.signals$.next(signals);
    this.setRecordsCount(dbKey);
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
