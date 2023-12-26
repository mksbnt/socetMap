import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISignal } from '../../interfaces/signal.interface';
import { Subject, takeUntil } from 'rxjs';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { WithinDurationPipe } from '../../pipes/within-duration.pipe';
import { ControllerService } from '../../services/controller.service';

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
    WithinDurationPipe,
  ],
})
export default class CodeComponent implements OnInit, OnDestroy {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  private destroy$ = new Subject<void>();
  public controllerService: ControllerService = inject(ControllerService);
  signals$: Subject<ISignal[]> = new Subject<ISignal[]>();

  ngOnInit(): void {
    this.controllerService.currentTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentTime) => {
        this.signals$.next(
          this.controllerService.getSignalsByTimestamp(
            this.controllerService.groupedSignals,
            currentTime
          )
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
