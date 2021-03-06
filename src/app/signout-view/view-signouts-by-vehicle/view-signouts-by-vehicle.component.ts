import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Vehicle } from 'app/models/vehicle';
import { VehicleSignout } from 'app/models/vehicle-signout';
import { VehicleUser } from 'app/models/vehicle-user';
import { SignoutDataService } from 'app/core/services/signout-data.service';
import { TimeService } from 'app/core/services/time.service';
import { UserService } from 'app/core/services/user.service';
import { VehicleService } from 'app/core/services/vehicle.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { EditSignoutDialogComponent } from '../../shared/components/edit-signout-dialog/edit-signout-dialog.component';

@Component({
  selector: 'app-view-signouts-by-vehicle',
  templateUrl: './view-signouts-by-vehicle.component.html',
  styleUrls: ['./view-signouts-by-vehicle.component.css'],
})
export class ViewSignoutsByVehicleComponent implements OnInit, OnDestroy {
  vehicleID$: ReplaySubject<string>;
  vehicle$: Observable<Vehicle>;
  signouts$: Observable<VehicleSignout[]>;
  lastSignout$: Observable<VehicleSignout>;
  currentTime$: Observable<string>;
  currentVehicle: Vehicle;
  destroy$: Subject<boolean>;
  user: VehicleUser;
  constructor(
    private route: ActivatedRoute,
    private sds: SignoutDataService,
    private vs: VehicleService,
    private ts: TimeService,
    private us: UserService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.vehicleID$ = new ReplaySubject<string>(1);
    this.currentTime$ = this.ts.getCurrentTime();

    this.vehicle$ = this.vehicleID$.pipe(
      switchMap((id) => this.vs.getVehicleByID(id))
    );

    this.signouts$ = this.vehicleID$.pipe(
      switchMap((id) =>
        this.sds.getSignoutsByVehicle(id, this.currentTime$)
      )
    );

    this.lastSignout$ = this.vehicleID$.pipe(
      switchMap(id => this.sds.getLastSignout(id, this.currentTime$))
    );

    this.route.paramMap
      .pipe(map((params) => params.get('vehicleID')))
      .subscribe((id) => {
        this.vehicleID$.next(id);
      });

      this.vehicle$.pipe(takeUntil(this.destroy$)).subscribe(vehicle => {
        this.currentVehicle = vehicle;
      });

      this.us.getUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
        this.user = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(false);
    this.destroy$.unsubscribe();
  }

  async openDialog() {
    const time = await this.ts.getCurrentTime().pipe(take(1)).toPromise()
    this.dialog.open(EditSignoutDialogComponent, {
      data: {
        vehicleName: this.currentVehicle.name,
        vehicleID: this.currentVehicle.uid,
        userID: this.user.uid,
        userName: this.user.displayName,
        uid: this.sds.createSignoutID(),
        startTime: time
      }
    }).afterClosed().subscribe((signout: VehicleSignout) => {
      if (signout) {
        this.sds.saveSignout(signout);
      }
    })
  }
}
