import { Injectable, inject } from '@angular/core';
import { ISignal } from '../interfaces/signal.interface';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);
  private signalAddedSource = new Subject<ISignal[]>();
  signalAdded$ = this.signalAddedSource.asObservable();

  emitSignalAdded(signal: ISignal[]) {
    this.signalAddedSource.next(signal);
  }

  write(data: ISignal[]) {
    this.dbService.bulkAdd('signals', data).subscribe((key) => {
      console.log(key, data);
      this.emitSignalAdded(data);
    });
  }

  getCount(): Observable<number> {
    return this.dbService.count('signals');
  }

  signals$: Observable<ISignal[]> = this.dbService.getAll<ISignal>('signals');
}
