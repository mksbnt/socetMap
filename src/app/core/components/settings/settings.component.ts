import { Component, inject } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
})
export default class SettingsComponent {
  private dbService: NgxIndexedDBService = inject(NgxIndexedDBService);

  clearDb() {
    this.dbService.clear('signals').subscribe((successDeleted) => {
      console.log('success? ', successDeleted);
    });
  }
}
