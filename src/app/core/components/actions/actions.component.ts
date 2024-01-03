import {
  Component,
  inject,
  HostListener,
  ViewChild,
  DestroyRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { ACTION } from '../../enums/action.enum';

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
        this.handleAction(ACTION.PLAY);
        break;
      case 'KeyL':
        this.handleAction(ACTION.LIVE);
        break;
    }
  }
  private worker: Worker = new Worker(
    new URL('./actions.worker', import.meta.url)
  );
  private stopListeningWebSocet: Subject<void> = new Subject<void>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  private sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  controllerActionsService: ControllerActionsService = inject(
    ControllerActionsService
  );
  websocketService: WebSocketService = inject(WebSocketService);
  dbService: IndexedDbService = inject(IndexedDbService);
  ACTION = ACTION;

  handleAction(action: ACTION): void {
    this.runAction(action, this.getButton(action));
  }

  private getButton = (action: ACTION): MatButton => {
    switch (action) {
      case ACTION.PLAY:
        return this.playButton;
      case ACTION.LIVE:
        return this.liveButton;
    }
  };

  private runAction(action: ACTION, button: MatButton): void {
    if (button.disabled) {
      return;
    }

    switch (action) {
      case ACTION.PLAY:
        this.controllerActionsService.isPlayModeActive
          ? this.stopPlayMode()
          : this.startPlayMode();
        break;
      case ACTION.LIVE:
        this.controllerActionsService.isLiveModeActive
          ? this.stopLiveMode()
          : this.startLiveMode();
        break;
    }
  }

  private stopPlayMode(): void {
    this.controllerActionsService.togglePlayMode();
    this.terminateWorker();
  }

  private startPlayMode(): void {
    this.controllerActionsService.togglePlayMode();
    this.runWorker(ACTION.PLAY);
  }

  private terminateWorker(): void {
    this.worker.terminate();
  }

  private runWorker(action: ACTION): void {
    this.worker = new Worker(new URL('./actions.worker', import.meta.url));

    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => {
        const currentTimestampMilliseconds = Number(data);

        if (action === ACTION.LIVE) {
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
            this.changeDetectorRef.markForCheck();
          }
        }

        this.sliderService.sliderTimestamp$.next(currentTimestampMilliseconds);
        this.sliderService.sliderValue = currentTimestampMilliseconds;
      };
      this.worker.postMessage(this.workerPostMessage(action));
    } else {
      console.log('Web workers are not supported in this environment');
    }
  }

  private workerPostMessage = (action: ACTION): number => {
    return action === ACTION.PLAY
      ? this.sliderService.sliderValue
      : currentTimestampMilliseconds();
  };

  private startLiveMode(): void {
    this.controllerActionsService.toggleLiveMode();

    this.websocketService.webSocket
      .asObservable()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.stopListeningWebSocet)
      )
      .subscribe((signals) => this.writeData(DB_KEYS.GROUPED_SIGNALS, signals));

    this.runWorker(ACTION.LIVE);
  }

  private stopLiveMode(): void {
    this.controllerActionsService.toggleLiveMode();
    this.stopListeningWebSocet.next();
    this.terminateWorker();
  }

  private writeData(key: DB_KEYS, data: ISignal | ISignal[]): void {
    this.dbService.write(key, Array.isArray(data) ? data : [data]);
  }
}
