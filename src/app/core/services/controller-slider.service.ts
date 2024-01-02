import { Injectable, inject } from '@angular/core';
import { TimeService } from './time.service';
import { BehaviorSubject } from 'rxjs';
import { ControllerService } from './controller.service';
import { IndexedDbService } from './indexed-db.service';
import { DB_KEYS } from '../enums/db-keys.enum';
import { ControllerActionsService } from './controller-actions.service';
import { subtractTwelveHoursMilliseconds } from '../utils/time.util';

@Injectable({
  providedIn: 'root',
})
export class ControllerSliderService {
  private controllerService: ControllerService = inject(ControllerService);
  private dbService = inject(IndexedDbService);
  private timeService: TimeService = inject(TimeService);
  private actionsService: ControllerActionsService = inject(
    ControllerActionsService
  );

  private _sliderValue: number = this.modifyTimestamp(
    this.currentTimestampMilliseconds()
  );
  public get sliderValue() {
    return this._sliderValue;
  }
  public set sliderValue(value) {
    this._sliderValue = value;
  }

  modifyTimestamp(timestamp: number): number {
    return Math.abs(timestamp - 12 * 60 * 60 * 1000);
  }

  sliderValueChange(newValue: number) {
    this.sliderTimestamp = newValue;
    this.sliderTimestamp$.next(this.sliderTimestamp);
  }

  sliderTimestamp$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.modifyTimestamp(this.currentTimestampMilliseconds())
  );

  constructor() {
    this.sliderTimestamp$.subscribe((timestamp) => {
      this.controllerService.setCurrentTime(Math.floor(timestamp / 1000));
      if (!this.actionsService.isLiveModeActive) {
        this.dbService.get(
          DB_KEYS.GROUPED_SIGNALS,
          Math.floor(timestamp / 1000)
        );
      }
    });
  }

  private _sliderTimestamp: number = this.modifyTimestamp(
    this.currentTimestampMilliseconds()
  );

  public get sliderTimestamp() {
    return this._sliderTimestamp;
  }
  public set sliderTimestamp(value) {
    this._sliderTimestamp = value;
  }

  currentTimestampMilliseconds(): number {
    return this.timeService.currentTimestampMilliseconds;
  }

  maxSliderValue: number = this.timeService.currentTimestampMilliseconds;
  minSliderValue: number = subtractTwelveHoursMilliseconds(
    this.timeService.currentTimestampMilliseconds
  );

  maxSliderValue$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.maxSliderValue
  );
  minSliderValue$: BehaviorSubject<number> = new BehaviorSubject<number>(
    this.minSliderValue
  );
}
