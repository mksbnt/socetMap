import {Component, DestroyRef, ViewEncapsulation, inject} from '@angular/core';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LatLngTuple, Marker, layerGroup, polygon, TileLayer, Layer} from 'leaflet';
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
      (leafletMapReady)="initializeMap($event)"
    ></div>
  `,
})
export default class MapComponent {
  public leafletOptions: { layers: TileLayer[] } = leafletOptions;
  private signalsService: SignalsService = inject(SignalsService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  initializeMap(map: L.Map) {
    const {
      pointsLayer,
      zonesLayer,
      pointsStream$,
      zonesStream$
    } = this.createLayers(map);

    this.subscribeToPointsChanges(pointsStream$, pointsLayer);
    this.subscribeToZonesChanges(zonesStream$, zonesLayer);
    this.observeAndProcessSignals(map, pointsStream$, zonesStream$);
  }

  private createLayers(map: L.Map) {
    const pointsLayer = layerGroup().addTo(map);
    const zonesLayer = layerGroup().addTo(map);
    const pointsStream$ = new Subject<LatLngTuple[]>();
    const zonesStream$ = new Subject<LatLngTuple[][]>();
    return {pointsLayer, zonesLayer, pointsStream$, zonesStream$};
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

  private updatePointsLayer(points: LatLngTuple[], pointsLayer: L.LayerGroup): void {
    this.removeExtraMarkers(points, pointsLayer);
    this.insertMarkers(points, pointsLayer);
  }

  private insertMarkers(points: LatLngTuple[], pointsLayer: L.LayerGroup): void {
    points.forEach((pointCoordinates: LatLngTuple): void => {
      const existingMarker = this.findExistingMarker(pointCoordinates, pointsLayer);
      existingMarker ? existingMarker.setLatLng(pointCoordinates) : this.createNewMarker(pointCoordinates, pointsLayer);
    });
  }

  private removeExtraMarkers(points: LatLngTuple[], pointsLayer: L.LayerGroup): void {
    pointsLayer.eachLayer((layer: Layer): void => {
      if (layer instanceof Marker) {
        const existingMarker = layer as Marker;
        const isMarkerPresent = points.some((pointCoordinates: LatLngTuple) =>
          existingMarker.getLatLng().equals(pointCoordinates)
        );
        if (!isMarkerPresent) {
          pointsLayer.removeLayer(existingMarker);
        }
      }
    });
  }

  private findExistingMarker(pointCoordinates: LatLngTuple, pointsLayer: L.LayerGroup): Marker | undefined {
    return pointsLayer
      .getLayers()
      .find(
        (layer) =>
          layer instanceof Marker &&
          (layer as Marker).getLatLng().equals(pointCoordinates)
      ) as Marker;
  }

  private createNewMarker(pointCoordinates: LatLngTuple, pointsLayer: L.LayerGroup): void {
    new Marker(pointCoordinates, {icon: pointIcon}).addTo(pointsLayer);
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
    this.removeExtraPolygons(existingPolygons, zones, zonesLayer);
    this.updatePolygons(existingPolygons, zones, zonesLayer);
  }

  private removeExtraPolygons(existingPolygons: L.Polygon[], zones: LatLngTuple[][], zonesLayer: L.LayerGroup) {
    existingPolygons.forEach(existingPolygon => {
      const matchingZone = zones.find(zone => deepArrayEquals(existingPolygon.getLatLngs(), zone));
      if (!matchingZone) {
        zonesLayer.removeLayer(existingPolygon);
      }
    });
  }

  private updatePolygons(existingPolygons: L.Polygon[], zones: LatLngTuple[][], zonesLayer: L.LayerGroup) {
    zones.forEach(zone => {
      const existingPolygon = existingPolygons.find(polygon => deepArrayEquals(polygon.getLatLngs(), zone));
      existingPolygon ? existingPolygon.setLatLngs(zone) : polygon(zone, polygonOptions).addTo(zonesLayer);
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
