import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CarEntity } from '../../../domain/car';
import { GetCarsUseCase } from '../../../application/use-cases/get-cars.use-case';
import { DeleteCarUseCase } from '../../../application/use-cases/delete-car.use-case';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog.service';

@Component({
  selector: 'app-car-list-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-header">
      <h1>Cars</h1>
      <button mat-raised-button color="primary" (click)="router.navigate(['/cars/new'])">
        <mat-icon>add</mat-icon> Add Car
      </button>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (items().length === 0) {
      <p class="empty-state">No cars found.</p>
    } @else {
      <mat-table [dataSource]="items()">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.name }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="brand">
          <mat-header-cell *matHeaderCellDef>Brand</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.brand }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="type">
          <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.type }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="status">
          <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.status }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef></mat-header-cell>
          <mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="edit(row)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(row)"><mat-icon>delete</mat-icon></button>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="columns" />
        <mat-row *matRowDef="let row; columns: columns" />
      </mat-table>

      <mat-paginator
        [length]="total()"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex()"
        (page)="onPage($event)"
      />
    }
  `,
  styles: `
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; color: #888; padding: 40px; }
    mat-table { width: 100%; }
  `,
})
export class CarListPage implements OnInit {
  readonly router = inject(Router);
  private readonly getCars = inject(GetCarsUseCase);
  private readonly deleteCar = inject(DeleteCarUseCase);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly columns = ['name', 'brand', 'type', 'status', 'actions'];
  readonly pageSize = 20;
  readonly loading = signal(false);
  readonly items = signal<CarEntity[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.getCars.execute({ page: this.pageIndex(), limit: this.pageSize }).subscribe({
      next: ({ items, total }) => {
        this.items.set(items);
        this.total.set(total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.load();
  }

  edit(car: CarEntity): void {
    this.router.navigate(['/cars', car.id, 'edit']);
  }

  delete(car: CarEntity): void {
    this.confirmDialog
      .confirm({
        title: 'Delete Car',
        message: `Delete "${car.name}"?`,
        confirmLabel: 'Delete',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deleteCar.execute(car.id).subscribe(() => this.load());
        }
      });
  }
}
