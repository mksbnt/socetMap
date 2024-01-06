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
import { DB_KEYS } from '../../enums/db-keys.enum';
import { Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ControllerSliderService } from '../../services/controller-slider.service';
import {
  currentTimestampMilliseconds,
  secondsToMilliseconds,
} from '../../utils/time.util';
import { ACTION } from '../../enums/action.enum';
import { isPlayAction } from '../../utils/action.util';
import { isOverLimit } from '../../utils/slider.util';
import { makeArray } from '../../utils/array.util';
import { SignalsService } from '../../services/signals.service';
import { ActionDetails } from '../../interfaces/action.inteface';

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
  @ViewChild('nextButton') nextButton!: MatButton;
  @ViewChild('prevButton') prevButton!: MatButton;
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
  private worker!: Worker;
  private stopListeningWebSocet: Subject<void> = new Subject<void>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  private sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  signalsService: SignalsService = inject(SignalsService);
  controllerActionsService: ControllerActionsService = inject(
    ControllerActionsService
  );
  websocketService: WebSocketService = inject(WebSocketService);
  dbService: IndexedDbService = inject(IndexedDbService);
  ACTION = ACTION;

  private actionMapping!: Record<ACTION, ActionDetails>;

  ngAfterViewInit(): void {
    this.initializeActionMapping();
  }

  initializeActionMapping(): void {
    this.actionMapping = {
      [ACTION.PLAY]: {
        button: this.playButton,
        actionHandler: this.togglePlayMode.bind(this),
      },
      [ACTION.LIVE]: {
        button: this.liveButton,
        actionHandler: this.toggleLiveMode.bind(this),
      },
      [ACTION.NEXT]: {
        button: this.nextButton,
        actionHandler: this.nextSignal.bind(this),
      },
      [ACTION.PREV]: {
        button: this.prevButton,
        actionHandler: this.prevSignal.bind(this),
      },
    };
  }

  handleAction(action: ACTION): void {
    this.runAction(action);
  }

  private runAction(action: ACTION): void {
    try {
      const { button, actionHandler } = this.getActionDetails(action);

      if (!button.disabled) {
        actionHandler();
      }
    } catch (error) {
      console.error('Error handling action:', error);
    }
  }

  getActionDetails(action: ACTION): ActionDetails {
    const details = this.actionMapping[action];
    if (details) {
      return details;
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  }

  private prevSignal(): void {
    const previousTimestamp =
      this.signalsService.previousSignalsTimestamp$.getValue();

    if (previousTimestamp) {
      this.sliderService.setSliderValue(
        secondsToMilliseconds(previousTimestamp)
      );
    }
  }

  private nextSignal(): void {
    const netxTimestamp = this.signalsService.nextSignalsTimestamp$.getValue();

    if (netxTimestamp) {
      this.sliderService.setSliderValue(secondsToMilliseconds(netxTimestamp));
    }
  }

  private togglePlayMode(): void {
    this.controllerActionsService.isPlayModeActive
      ? this.stopPlayMode()
      : this.startPlayMode();
  }

  private toggleLiveMode(): void {
    this.controllerActionsService.isLiveModeActive
      ? this.stopLiveMode()
      : this.startLiveMode();
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

  private workerPlayAction(): void {
    if (
      isOverLimit(
        this.sliderService.sliderValue,
        this.sliderService.maxSliderValue$.value
      )
    ) {
      this.controllerActionsService.togglePlayMode();
      this.terminateWorker();
      this.changeDetectorRef.markForCheck();
    }
  }

  private runWorker(
    action: ACTION,
    isActionPlay: boolean = isPlayAction(action)
  ): void {
    this.worker = new Worker(new URL('./actions.worker', import.meta.url));

    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => {
        const currentTimestampMilliseconds = Number(data);

        isActionPlay
          ? this.workerPlayAction()
          : this.sliderService.updateSliderRange(currentTimestampMilliseconds);

        this.sliderService.setSliderValue(currentTimestampMilliseconds);
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
      .subscribe((signals) =>
        this.dbService.write(DB_KEYS.GROUPED_SIGNALS, makeArray(signals))
      );

    this.runWorker(ACTION.LIVE);
  }

  private stopLiveMode(): void {
    this.controllerActionsService.toggleLiveMode();
    this.stopListeningWebSocet.next();
    this.terminateWorker();
  }
}
