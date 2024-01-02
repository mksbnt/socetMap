import { Component, OnInit, inject } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { lastValueFrom } from 'rxjs';
import { INewGroupedSignal } from './core/interfaces/signal.interface';
import { DB_KEYS } from './core/enums/db-keys.enum';
import { ControllerSliderService } from './core/services/controller-slider.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);
  private sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );
  async getAllSignalsPromise(): Promise<INewGroupedSignal[]> {
    return lastValueFrom(this.dbService.getAll(DB_KEYS.GROUPED_SIGNALS));
  }

  async ngOnInit(): Promise<void> {
    try {
      const signals = await this.getAllSignalsPromise();
      const lastSignal = signals.at(-1);

      if (lastSignal) {
        const timestampMilliseconds = lastSignal.timestamp * 1000;
        this.sliderService.sliderTimestamp$.next(timestampMilliseconds);
        this.sliderService.sliderValue = timestampMilliseconds;
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
      console.error('There are no data in DB. Run Live Mode');
    }
  }
}
