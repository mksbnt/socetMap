import {Injectable, inject, Inject} from '@angular/core';
import {INewGroupedSignal, ISignal} from '../interfaces/signal.interface';
import {NgxIndexedDBService} from 'ngx-indexed-db';
import {
  BehaviorSubject,
  distinctUntilChanged,
  lastValueFrom,
  tap,
} from 'rxjs';
import {DB_KEYS} from '../enums/db-keys.enum';
import {SignalsService} from './signals.service';
import {
  extractTimestampAndSignals,
  groupSignalsByTimestamp,
  oldSignalsIds,
} from '../utils/signal.util';
import {NotificationService} from "./notification.service";
import {WINDOW} from "../providers/window.provider";

const message = {
  connected: 'The indexed-db is connected',
  notConnected: 'The indexed-db not is connected',
};

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  recordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  // db!: IDBDatabase;
  private notificationService = inject(NotificationService);
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);
  private signalsService: SignalsService = inject(SignalsService);
  private readonly request!: IDBOpenDBRequest;
  private db!: IDBDatabase;

  constructor(@Inject(WINDOW) private window: Window) {
    this.setRecordsCount(DB_KEYS.GROUPED_SIGNALS);


    if (!('indexedDB' in this.window)) {
      console.log("This browser doesn't support IndexedDB");
      return;
    }

    const dbName: string = DB_KEYS.GROUPED_SIGNALS;
    const dbVersion: number = 4;

    try {
      this.request = this.window.indexedDB.open(dbName, dbVersion);
    } catch (e) {
      console.log(e)
    }

    this.request.onerror = (event: Event): void => {
      const dbOpenRequest: IDBOpenDBRequest = event.target as IDBOpenDBRequest;
      console.error(`Database error: ${dbOpenRequest.error && dbOpenRequest.error.message}`);
      this.showNotification(message.notConnected);
    }

    this.request.onsuccess = (event: Event): void => {
      // console.log(event.timeStamp) :TODO Can use event.timeStamp to delete old records from indexed-db
      const dbOpenRequest: IDBOpenDBRequest = event.target as IDBOpenDBRequest;
      this.db = dbOpenRequest.result;
      this.showNotification(message.connected);
    };

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

  write(key: DB_KEYS, data: ISignal[]) {
    const [timestamp, signals] = extractTimestampAndSignals(
      groupSignalsByTimestamp(data)
    );

    this.dbService
      .add(key, {timestamp, signals})
      .pipe(
        tap(() =>
          this.onWriteHandler(timestamp, signals, DB_KEYS.GROUPED_SIGNALS)
        )
      )
      .subscribe();
  }

  async getAllRecords(key: DB_KEYS): Promise<INewGroupedSignal[]> {
    return lastValueFrom(this.dbService.getAll(key));
  }

  private showNotification(message: string): void {
    this.notificationService.showNotification(message);
  }

  private handleGetResponse(response: INewGroupedSignal | undefined): void {
    response
      ? this.setSignal(response.signals)
      : this.signalsService.signals$.next([]);
  }

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

  private onWriteHandler(
    timestamp: number,
    signals: ISignal[],
    dbKey: DB_KEYS
  ): void {
    this.deleteOldSignals(dbKey, timestamp);
    this.signalsService.signals$.next(signals);
    this.setRecordsCount(dbKey);
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
