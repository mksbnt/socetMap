import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LatLngTuple, Marker, layerGroup, polygon } from 'leaflet';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { leafletOptions, pointIcon, polygonOptions } from './map.constants';
import {
  deepArrayEquals,
  extractPoints,
  extractZones,
  findCenter,
  sortZones,
} from './map.methods';
import { SignalsService } from '../../services/signals.service';
@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [LeafletModule, MatIconModule],
  standalone: true,
  template: `
    <div
      leaflet
      style="height: 100%"
      [leafletOptions]="leafletOptions"
      (leafletMapReady)="onMapReady($event)"
    ></div>
  `,
})
export default class MapComponent {
  private destroyRef = inject(DestroyRef);
  public signalsService: SignalsService = inject(SignalsService);
  public leafletOptions = leafletOptions;

  onMapReady(map: L.Map) {
    const pointsLayer = layerGroup().addTo(map);
    const zonesLayer = layerGroup().addTo(map);

    const pointsSubject$: Subject<LatLngTuple[]> = new Subject<LatLngTuple[]>();
    const zonesSubject$: Subject<LatLngTuple[][]> = new Subject<
      LatLngTuple[][]
    >();

    zonesSubject$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((zones) => {
        const existingPolygons = zonesLayer.getLayers() as L.Polygon[];

        // Remove polygons that are not present in the new zones
        existingPolygons.forEach((existingPolygon) => {
          const matchingZone = zones.find((zone) =>
            deepArrayEquals(existingPolygon.getLatLngs(), zone)
          );

          if (!matchingZone) {
            zonesLayer.removeLayer(existingPolygon);
          }
        });

        // Add or update polygons based on the new zones
        zones.forEach((zone: LatLngTuple[]) => {
          const existingPolygon = existingPolygons.find((polygon) =>
            deepArrayEquals(polygon.getLatLngs(), zone)
          );

          if (existingPolygon) {
            existingPolygon.setLatLngs(zone);
          } else {
            polygon(zone, polygonOptions).addTo(zonesLayer);
          }
        });
      });

    pointsSubject$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((points) => {
        points.forEach((pointCoordinates) => {
          const existingMarker = pointsLayer
            .getLayers()
            .find(
              (layer) =>
                layer instanceof Marker &&
                (layer as Marker).getLatLng().equals(pointCoordinates)
            );

          if (existingMarker) {
            // Update existing marker position
            (existingMarker as Marker).setLatLng(pointCoordinates);
          } else {
            // Create and add new marker
            new Marker(pointCoordinates, { icon: pointIcon }).addTo(
              pointsLayer
            );
          }
        });

        // Remove any extra markers if the new data has fewer points
        pointsLayer.eachLayer((layer) => {
          if (layer instanceof Marker) {
            const existingMarker = layer as Marker;
            const isMarkerPresent = points.some((pointCoordinates) =>
              existingMarker.getLatLng().equals(pointCoordinates)
            );

            if (!isMarkerPresent) {
              pointsLayer.removeLayer(existingMarker);
            }
          }
        });
      });

    this.signalsService.signals$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((signals) => {
        if (signals.length) {
          const points = extractPoints(signals);
          const zones = sortZones(extractZones(signals));

          pointsSubject$.next(points);
          zonesSubject$.next(zones);
          map.setView(findCenter(points), 13);
        } else {
          pointsSubject$.next([]);
          zonesSubject$.next([]);
        }
      });
  }
}
