import {InjectionToken} from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WindowToken');

export function windowProvider(): Window {
  return window;
}
