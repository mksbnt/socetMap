import {
  Component,
  inject,
  HostListener,
  ViewChild,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ControllerActionsService } from '../../services/controller-actions.service';
import { WebSocketService } from '../../services/web-socket.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { ISignal } from '../../interfaces/signal.interface';
import { DB_KEYS } from '../../enums/db-keys.enum';
import { Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ControllerSliderService } from '../../services/controller-slider.service';
import {
  currentTimestampMilliseconds,
  subtractTwelveHoursMilliseconds,
} from '../../utils/time.util';
import { MODE } from '../../enums/mode.enum';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  websocketService: WebSocketService = inject(WebSocketService);
  private dbService: IndexedDbService = inject(IndexedDbService);
  private worker: Worker = new Worker(
    new URL('./actions.worker', import.meta.url)
  );
  private stopListeningWebSocet: Subject<void> = new Subject<void>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  private sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );

  playAction(): void {
    if (this.playButton.disabled) {
      return;
    }

    if (!this.controllerActionsService.isPlayModeActive) {
      this.controllerActionsService.togglePlayMode();
      this.runWorker(MODE.PLAY);
    } else {
      this.controllerActionsService.togglePlayMode();
      this.terminateWorker();
    }
  }

  terminateWorker(): void {
    this.worker.terminate();
  }

  runWorker(mode: MODE): void {
    this.worker = new Worker(new URL('./actions.worker', import.meta.url));

    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => {
        const currentTimestampMilliseconds = Number(data);

        if (mode === MODE.LIVE) {
          this.sliderService.maxSliderValue$.next(currentTimestampMilliseconds);
          this.sliderService.minSliderValue$.next(
            subtractTwelveHoursMilliseconds(currentTimestampMilliseconds)
          );
        } else {
          if (
            this.sliderService.sliderValue >=
            this.sliderService.maxSliderValue$.value
          ) {
            this.controllerActionsService.togglePlayMode();
            this.terminateWorker();
          }
        }

        this.sliderService.sliderTimestamp$.next(currentTimestampMilliseconds);
        this.sliderService.sliderValue = currentTimestampMilliseconds;
      };
      this.worker.postMessage(this.workerPostMessage(mode));
    } else {
      console.log('Web workers are not supported in this environment');
    }
  }

  workerPostMessage = (mode: MODE): number => {
    return mode === MODE.PLAY
      ? this.sliderService.sliderValue
      : currentTimestampMilliseconds();
  };

  liveAction(): void {
    this.liveButton.disabled
      ? () => {
          return;
        }
      : !this.controllerActionsService.isLiveModeActive
      ? this.startLiveMode()
      : this.stopLiveMode();
  }

  startLiveMode(): void {
    this.controllerActionsService.toggleLiveMode();

    this.websocketService.webSocket
      .asObservable()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.stopListeningWebSocet)
      )
      .subscribe((signals) => this.writeData(DB_KEYS.GROUPED_SIGNALS, signals));

    this.runWorker(MODE.LIVE);
  }

  stopLiveMode(): void {
    this.controllerActionsService.toggleLiveMode();
    this.stopListeningWebSocet.next();
    this.terminateWorker();
  }

  writeData(key: DB_KEYS, data: ISignal | ISignal[]): void {
    this.dbService.write(key, Array.isArray(data) ? data : [data]);
  }
}
