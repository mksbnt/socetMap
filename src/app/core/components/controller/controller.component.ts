import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { ISignal } from '../../interfaces/signal.interface';
import { IndexedDbService } from '../../services/indexed-db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ControllerService } from '../../services/controller.service';
import { ControllerActionsService } from '../../services/controller-actions.service';
import { ActionsComponent } from '../actions/actions.component';
import { TimeComponent } from '../time/time.component';

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
    ActionsComponent,
    TimeComponent,
  ],
  standalone: true,
})
export default class ControllerComponent implements OnInit {
  private dbService: IndexedDbService = inject(IndexedDbService);
  public controllerService: ControllerService = inject(ControllerService);
  public controllerActionsService: ControllerActionsService = inject(
    ControllerActionsService
  );

  get isSliderDisabled(): boolean {
    return this.controllerActionsService.isLiveModeActive ||
      this.controllerActionsService.isPlayModeActive
      ? true
      : this.controllerService.signalsCount
      ? false
      : true;
  }

  ngOnInit(): void {
    this.dbService.signals$.subscribe((signals: ISignal[]) => {
      this.controllerService.signals = signals;
      this.controllerService.updateSignals();
    });
  }
}
