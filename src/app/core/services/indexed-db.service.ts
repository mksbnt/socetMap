import { Injectable, inject } from '@angular/core';
import { ISignal } from '../interfaces/signal.interface';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject, filter, map, tap } from 'rxjs';
import { DB_KEYS } from '../enums/db-keys.enum';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);
  private signalAddedSource = new Subject<ISignal[]>();

  signalAdded$ = this.signalAddedSource.asObservable();
  signals$: Observable<ISignal[]> = this.dbService
    .getAll<ISignal>('signals')
    .pipe(
      tap((signals) =>
        this.oldSignalsIds(signals).length
          ? this.bulkDelete(DB_KEYS.SIGNALS, this.oldSignalsIds(signals))
          : null
      ),
      map((signals) =>
        signals.filter((signal) => signal.timestamp >= this.twelveHoursAgo())
      )
    );

  private twelveHoursAgo = (date: Date = new Date()): number =>
    date.setHours(date.getHours() - 12);

  private oldSignalsIds = (() => {
    let cachedResult: number[] | undefined = undefined;

    return (
      signals: ISignal[],
      twelveHoursAgo: number = this.twelveHoursAgo()
    ): number[] => {
      if (!cachedResult || cachedResult.length !== signals.length) {
        cachedResult = signals
          .filter((signal) => signal.timestamp < twelveHoursAgo)
          .map((signal) => signal.id as number)
          .filter((id) => id !== undefined);
      }
      return cachedResult;
    };
  })();

  bulkDelete(key: DB_KEYS, ids: number[]): void {
    this.dbService.bulkDelete(key, ids).subscribe();
  }

  emitSignalAdded(signal: ISignal[]) {
    this.signalAddedSource.next(signal);
  }

  write(key: DB_KEYS, data: ISignal[]) {
    // todo: can use groupSignalsByTimestamp() here & write prepared data
    this.dbService
      .bulkAdd(DB_KEYS.SIGNALS, data)
      .subscribe(() => this.emitSignalAdded(data));
  }
}
