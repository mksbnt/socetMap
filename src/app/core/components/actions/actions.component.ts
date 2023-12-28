import { Component, inject, HostListener, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ControllerActionsService } from '../../services/controller-actions.service';
import { WebSocetService } from '../../services/web-socet.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { ControllerService } from '../../services/controller.service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { ISignal } from '../../interfaces/signal.interface';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
})
export class ActionsComponent {
  @ViewChild('liveButton') liveButton!: MatButton;
  @ViewChild('playButton') playButton!: MatButton;
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyP':
        this.playAction();
        break;
      case 'KeyL':
        this.liveAction();
        break;
    }
  }
  public controllerActionsService: ControllerActionsService = inject(
    ControllerActionsService
  );
  private websocketService: WebSocetService = inject(WebSocetService);
  private dbService: IndexedDbService = inject(IndexedDbService);
  public controllerService: ControllerService = inject(ControllerService);
  private worker: Worker = new Worker(
    new URL('./actions.worker', import.meta.url)
  );

  keys: string[] = [];
  currentKey: string = '';
  nextKey: string = '';
  lastKey = '';

  playAction(): void {
    if (this.playButton.disabled) {
      return;
    }

    if (!this.controllerActionsService.isPlayModeActive) {
      this.controllerActionsService.togglePlayMode();
      this.runWorker();
    } else {
      this.controllerActionsService.togglePlayMode();
      this.terminateWorker();
    }
  }

  terminateWorker(): void {
    this.worker.terminate();
  }

  runWorker(): void {
    // refactor method
    this.keys = Object.keys(this.controllerService.groupedSignals);
    this.currentKey = this.keys[this.controllerService.sliderValue - 1];
    this.nextKey = this.keys[this.controllerService.sliderValue];
    this.lastKey = this.keys[this.keys.length - 1];
    this.worker = new Worker(new URL('./actions.worker', import.meta.url));

    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => {
        this.controllerService.playModeTime = data;

        if (data > this.nextKey) {
          this.controllerService.sliderValue =
            this.controllerService.sliderValue + 1;
          this.controllerService.setCurrentTime(Number(this.nextKey));
          this.nextKey = this.setNextKey(this.nextKey, this.keys);
        }
      };
      this.worker.postMessage(`${this.currentKey};${this.lastKey}`);
    } else {
      console.log('Web workers are not supported in this environment');
    }
  }

  setNextKey = (currentValue: string, array: string[]): string => {
    const index = array.indexOf(currentValue);

    if (index === -1) {
      this.terminateWorker();
      return currentValue;
    }

    return array[index + 1];
  };

  liveAction(): void {
    if (this.liveButton.disabled) {
      return;
    }

    if (!this.controllerActionsService.isLiveModeActive) {
      this.controllerActionsService.toggleLiveMode();
      this.websocketService.connect().subscribe((signals) => {
        this.writeData(signals);

        this.controllerService.signals.length === 0
          ? (this.controllerService.signals = signals)
          : (this.controllerService.spreadSignals = signals);

        this.controllerService.updateSignals();
      });
    } else {
      this.controllerActionsService.toggleLiveMode();
      this.websocketService.disconnect();
    }
  }

  writeData(data: ISignal | ISignal[]): void {
    const array: ISignal[] = Array.isArray(data) ? data : [data];
    this.dbService.write(array);
  }
}
