import { Injectable } from '@angular/core';
import { millisecondsToSeconds } from '../utils/time.util';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  currentTimestamp: Date = new Date();
  currentTimestampMilliseconds = this.currentTimestamp.getTime();
}
