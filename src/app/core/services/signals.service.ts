import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISignal } from '../interfaces/signal.interface';

@Injectable({
  providedIn: 'root',
})
export class SignalsService {
  signals$ = new BehaviorSubject<ISignal[]>([]);
  previousSignalsTimestamp$ = new BehaviorSubject<number | null>(null);
  nextSignalsTimestamp$ = new BehaviorSubject<number | null>(null);
}
