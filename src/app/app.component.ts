import { Component, OnInit, inject } from '@angular/core';
import { DB_KEYS } from './core/enums/db-keys.enum';
import { ControllerSliderService } from './core/services/controller-slider.service';
import { IndexedDbService } from './core/services/indexed-db.service';
import { getLastSignalTimestamp } from './core/utils/signal.util';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private dbService: IndexedDbService = inject(IndexedDbService);
  private sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );

  async ngOnInit(): Promise<void> {
    this.sliderService.setSliderValue(
      getLastSignalTimestamp(
        await this.dbService.getAllRecords(DB_KEYS.GROUPED_SIGNALS)
      )
    );
  }
}
