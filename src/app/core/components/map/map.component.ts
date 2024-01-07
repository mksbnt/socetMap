import {Component, DestroyRef, ViewEncapsulation, inject} from '@angular/core';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LatLngTuple, Marker, layerGroup, polygon, TileLayer} from 'leaflet';
import {MatIconModule} from '@angular/material/icon';
import {Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {leafletOptions, pointIcon, polygonOptions} from './map.constants';
import {deepArrayEquals, extractPoints, extractZones, findCenter, sortZones} from './map.methods';
import {SignalsService} from '../../services/signals.service';

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
  public leafletOptions: { layers: TileLayer[] } = leafletOptions;
  private signalsService: SignalsService = inject(SignalsService);
  private destroyRef: DestroyRef = inject(DestroyRef);


  onMapReady(map: L.Map) {
    const pointsLayer = layerGroup().addTo(map);
    const zonesLayer = layerGroup().addTo(map);
    const pointsStream$ = new Subject<LatLngTuple[]>();
    const zonesStream$ = new Subject<LatLngTuple[][]>();

    this.subscribeToPointsChanges(pointsStream$, pointsLayer);
    this.subscribeToZonesChanges(zonesStream$, zonesLayer);
    this.observeAndProcessSignals(map, pointsStream$, zonesStream$);
  }

  private subscribeToPointsChanges(
    pointsStream$: Subject<LatLngTuple[]>,
    pointsLayer: L.LayerGroup,
  ) {
    pointsStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((points) => {
        this.updatePointsLayer(points, pointsLayer);
      });
  }

  private updatePointsLayer(points: LatLngTuple[], pointsLayer: L.LayerGroup) {


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
        new Marker(pointCoordinates, {icon: pointIcon}).addTo(
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
  }

  private subscribeToZonesChanges(
    zonesStream$: Subject<LatLngTuple[][]>,
    zonesLayer: L.LayerGroup,
  ) {
    zonesStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((zones) => {
        this.updateZonesLayer(zones, zonesLayer);
      });
  }

  private updateZonesLayer(zones: LatLngTuple[][], zonesLayer: L.LayerGroup) {
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
  }

  private observeAndProcessSignals(
    map: L.Map,
    pointsStream$: Subject<LatLngTuple[]>,
    zonesStream$: Subject<LatLngTuple[][]>) {
    this.signalsService.signals$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((signals) => {
        const points = extractPoints(signals);
        const zones = sortZones(extractZones(signals));

        pointsStream$.next(points);
        zonesStream$.next(zones);

        if (points.length) {
          map.setView(findCenter(points), 13);
        }
      });
  }
}
