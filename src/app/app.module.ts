import {NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DBConfig, NgxIndexedDBModule} from 'ngx-indexed-db';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {DB_KEYS} from './core/enums/db-keys.enum';
import {WINDOW, windowProvider} from "./core/providers/window.provider";

const dbConfig: DBConfig = {
  name: DB_KEYS.GROUPED_SIGNALS,
  version: 4,
  objectStoresMeta: [
    {
      store: DB_KEYS.GROUPED_SIGNALS,
      storeConfig: {keyPath: 'id', autoIncrement: true},
      storeSchema: [
        {name: 'timestamp', keypath: 'timestamp', options: {unique: false}},
        {name: 'signals', keypath: 'signals', options: {unique: false}},
      ],
    },
  ],
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    BrowserAnimationsModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    LeafletModule,
  ],
  providers: [
    {provide: WINDOW, useFactory: windowProvider}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
