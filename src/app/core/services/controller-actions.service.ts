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

  private _isPlayModeActive = false;
  public get isPlayModeActive() {
    return this._isPlayModeActive;
  }
  public set isPlayModeActive(value) {
    this._isPlayModeActive = value;
  }

  togglePlayMode = () => (this.isPlayModeActive = !this.isPlayModeActive);
  toggleLiveMode = () => (this.isLiveModeActive = !this.isLiveModeActive);
}
