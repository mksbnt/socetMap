import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { ISignal } from '../../interfaces/signal.interface';
import { WebSocetService } from '../../services/web-socet.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ControllerService } from '../../services/controller.service';

import { ControllerActionsService } from '../../services/controller-actions.service';
import { ControllerSliderService } from '../../services/controller-slider.service';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule,
    MatSliderModule,
    CommonModule,
    FormsModule,
    MatMenuModule,
  ],
  standalone: true,
})
export default class ControllerComponent implements OnInit {
  private websocketService: WebSocetService = inject(WebSocetService);
  private dbService: IndexedDbService = inject(IndexedDbService);
  public controllerService: ControllerService = inject(ControllerService);
  public controllerActionsService: ControllerActionsService = inject(
    ControllerActionsService
  );
  public controllerSliderService = inject(ControllerSliderService);

  get isSliderDisabled(): boolean {
    return this.controllerActionsService.isLiveModeActive
      ? true
      : this.controllerService.signalsCount
      ? false
      : true;
  }

  play(): void {}

  ngOnInit(): void {
    this.dbService.signals$.subscribe((signals: ISignal[]) => {
      this.controllerService.signals = signals;
      this.controllerService.updateSignals();
    });
  }

  liveAction(): void {
    if (!this.controllerActionsService.isLiveModeActive) {
      this.controllerActionsService.isLiveModeActive =
        !this.controllerActionsService.isLiveModeActive;
      this.websocketService.connect().subscribe((signals) => {
        this.writeData(signals);

        this.controllerService.signals.length === 0
          ? (this.controllerService.signals = signals)
          : (this.controllerService.spreadSignals = signals);

        this.controllerService.updateSignals();
      });
    } else {
      this.controllerActionsService.isLiveModeActive =
        !this.controllerActionsService.isLiveModeActive;
      this.websocketService.disconnect();
    }
  }

  writeData(data: ISignal | ISignal[]): void {
    const array: ISignal[] = Array.isArray(data) ? data : [data];
    this.dbService.write(array);
  }
}
