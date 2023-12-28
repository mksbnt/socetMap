import { Component, NgZone, inject } from '@angular/core';
import { ControllerService } from '../../services/controller.service';
import { CommonModule } from '@angular/common';
import { ControllerActionsService } from '../../services/controller-actions.service';

@Component({
  selector: 'app-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time.component.html',
  styleUrl: './time.component.scss',
})
export class TimeComponent {
  public controllerService: ControllerService = inject(ControllerService);
  public controllerActionsService: ControllerActionsService = inject(
    ControllerActionsService
  );

  private worker: Worker = new Worker(
    new URL('./time.worker', import.meta.url)
  );
  currentTime: Date = new Date();

  ngOnInit(): void {
    this.runWorker();
  }
  ngOnDestroy(): void {
    this.terminateWorker();
  }

  runWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => {
        this.currentTime = data;
      };
      this.worker.postMessage('hello');
    } else {
      console.log('Web workers are not supported in this environment');
    }
  }

  terminateWorker(): void {
    this.worker.terminate();
  }
}
