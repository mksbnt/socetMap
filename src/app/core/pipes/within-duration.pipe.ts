import { Pipe, PipeTransform, Signal } from '@angular/core';
import { ISignal } from '../interfaces/signal.interface';

@Pipe({ name: 'withinDuration', standalone: true })
export class WithinDurationPipe implements PipeTransform {
  transform(signals: ISignal[], durationInSeconds: number): boolean {
    const currentTime = Date.now();
    const durationInMilliseconds = durationInSeconds * 1000;
    const startTime = currentTime - durationInMilliseconds;
    const endTime = currentTime + durationInMilliseconds;

    console.log(
      signals.some(
        (signal) => signal.timestamp >= startTime && signal.timestamp <= endTime
      )
    );

    return signals.some(
      (signal) => signal.timestamp >= startTime && signal.timestamp <= endTime
    );
  }
}
