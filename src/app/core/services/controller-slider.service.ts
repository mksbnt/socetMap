import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IndexedDbService } from './indexed-db.service';
import { DB_KEYS } from '../enums/db-keys.enum';
import { ControllerActionsService } from './controller-actions.service';
import {
  currentTimestampMilliseconds,
  subtractTwelveHoursMilliseconds,
} from '../utils/time.util';

@Injectable({
  providedIn: 'root',
})
export class ControllerSliderService {
  private dbService = inject(IndexedDbService);
  private actionsService: ControllerActionsService = inject(
    ControllerActionsService
  );
  private _sliderValue: number = this.modifyTimestamp(
    currentTimestampMilliseconds()
  );
  public get sliderValue() {
    return this._sliderValue;
  }
  public set sliderValue(value) {
    this._sliderValue = value;
  }
  private _sliderTimestamp: number = this.modifyTimestamp(
    currentTimestampMilliseconds()
  );
  public get sliderTimestamp() {
    return this._sliderTimestamp;
  }
  public set sliderTimestamp(value) {
    this._sliderTimestamp = value;
  }
  public signalsCount: number = 0;

  constructor() {
    this.sliderTimestamp$.subscribe((timestamp) => {
      if (!this.actionsService.isLiveModeActive) {
        this.dbService.get(
          DB_KEYS.GROUPED_SIGNALS,
          Math.floor(timestamp / 1000)
        );
      }
    });
  }

  sliderTimestamp$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.modifyTimestamp(currentTimestampMilliseconds())
  );

  modifyTimestamp(timestamp: number): number {
    return Math.abs(timestamp - 12 * 60 * 60 * 1000);
  }

  sliderValueChange(newValue: number) {
    this.setSliderValue(newValue);
  }

  setSliderValue(timeStamp: number): void {
    this.sliderValue = timeStamp;
    this.sliderTimestamp = timeStamp;
    this.sliderTimestamp$.next(timeStamp);
  }

  maxSliderValue: number = currentTimestampMilliseconds();
  minSliderValue: number = subtractTwelveHoursMilliseconds(
    currentTimestampMilliseconds()
  );

  maxSliderValue$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.maxSliderValue
  );
  minSliderValue$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.minSliderValue
  );
}
