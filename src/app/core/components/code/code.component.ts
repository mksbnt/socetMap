import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISignal } from '../../interfaces/signal.interface';
import { BehaviorSubject } from 'rxjs';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { ControllerService } from '../../services/controller.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControllerSliderService } from '../../services/controller-slider.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { DB_KEYS } from '../../enums/db-keys.enum';
import { SignalsService } from '../../services/signals.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export default class CodeComponent {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  public controllerService: ControllerService = inject(ControllerService);
  public signalsService: SignalsService = inject(SignalsService);
}
