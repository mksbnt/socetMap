import { Injectable, inject } from '@angular/core';
import { INewGroupedSignal, ISignal } from '../interfaces/signal.interface';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DB_KEYS } from '../enums/db-keys.enum';
import { ControllerService } from './controller.service';
import { SignalsService } from './signals.service';
import {
  extractTimestampAndSignals,
  oldSignalsIds,
} from '../utils/signal.util';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);
  private controllerService: ControllerService = inject(ControllerService);
  private signalsService: SignalsService = inject(SignalsService);
  signalsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  get(key: DB_KEYS, timeStamp: number) {
    this.dbService
      .getByIndex<INewGroupedSignal>(key, 'timestamp', timeStamp)
      .pipe(tap(() => this.getRecordsCount(DB_KEYS.GROUPED_SIGNALS)))
      .subscribe((res) => {
        res
          ? this.signalsService.signals$.next(res.signals)
          : this.signalsService.signals$.next([]);
      });
  }

  write(key: DB_KEYS, data: ISignal[]) {
    const [timestamp, signals] = extractTimestampAndSignals(
      this.controllerService.groupSignalsByTimestamp(data)
    );

    this.dbService
      .add(key, { timestamp, signals })
      .pipe(
        tap(() => this.signalsService.signals$.next(signals)),
        tap(() => this.deleteOldSignals(DB_KEYS.GROUPED_SIGNALS, timestamp)),
        tap(() => this.getRecordsCount(DB_KEYS.GROUPED_SIGNALS))
      )
      .subscribe();
  }

  getRecordsCount(key: DB_KEYS): Observable<number> {
    return this.dbService.count(key);
  }

  private deleteOldSignals(key: DB_KEYS, currentTimestamp: number): void {
    this.dbService
      .getAll<INewGroupedSignal>(DB_KEYS.GROUPED_SIGNALS)
      .pipe(tap(() => this.getRecordsCount(DB_KEYS.GROUPED_SIGNALS)))
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
