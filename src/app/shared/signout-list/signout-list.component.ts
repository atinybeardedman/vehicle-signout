import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  EventEmitter,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { VehicleSignout } from "app/models/vehicle-signout";

@Component({
  selector: "signout-list",
  templateUrl: "./signout-list.component.html",
  styleUrls: ["./signout-list.component.css"],
})
export class SignoutListComponent implements OnChanges {
  @Input() signouts: VehicleSignout[];
  @Input() showActions: boolean;
  @Output() edit = new EventEmitter<VehicleSignout>();
  @Output() remove = new EventEmitter<VehicleSignout>();
  dataSource = new MatTableDataSource<VehicleSignout>();
  defaultColumns: string[] = ["reason", "startTime", "endTime"];
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.signouts &&
      changes.signouts.currentValue !== changes.signouts.previousValue
    ) {
      this.dataSource.data = this.signouts;
    }
  }

  get displayedColumns(): string[] {
    return this.showActions
      ? [...this.defaultColumns, "actions"]
      : ["userName", ...this.defaultColumns];
  }
}