import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISignal } from '../interfaces/signal.interface';

@Injectable({
  providedIn: 'root',
})
export class SignalsService {
  signals$: BehaviorSubject<ISignal[]> = new BehaviorSubject<ISignal[]>([]);
}
