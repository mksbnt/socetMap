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
export default class CodeComponent implements OnInit {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  private destroyRef = inject(DestroyRef);
  public controllerService: ControllerService = inject(ControllerService);
  signals$: BehaviorSubject<ISignal[]> = new BehaviorSubject<ISignal[]>([]);

  ngOnInit(): void {
    this.controllerService.currentTime$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentTime) => {
        this.signals$.next(
          this.controllerService.getSignalsByTimestamp(
            this.controllerService.groupedSignals,
            currentTime
          )
        );
      });
  }
}
