import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ControllerActionsService {
  private _isLiveModeActive = false;
  public get isLiveModeActive() {
    return this._isLiveModeActive;
  }
  public set isLiveModeActive(value) {
    this._isLiveModeActive = value;
  }
}
