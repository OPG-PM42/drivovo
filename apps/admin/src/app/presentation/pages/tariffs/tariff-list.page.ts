import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TariffEntity } from '../../../domain/tariff';
import { GetTariffsUseCase } from '../../../application/use-cases/get-tariffs.use-case';
import { DeleteTariffUseCase } from '../../../application/use-cases/delete-tariff.use-case';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';

@Component({
  selector: 'app-tariff-list-page',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-header">
      <h1>Tariffs</h1>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="type-filter">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="typeFilter" (ngModelChange)="onFilterChange()">
            <mat-option value="">All</mat-option>
            <mat-option value="leasing">Leasing</mat-option>
            <mat-option value="subscription">Subscription</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="router.navigate(['/tariffs/new'])">
          <mat-icon>add</mat-icon> Add Tariff
        </button>
      </div>
    </div>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (items().length === 0) {
      <p class="empty-state">No tariffs found.</p>
    } @else {
      <mat-table [dataSource]="items()">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.name }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="type">
          <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.type }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="options">
          <mat-header-cell *matHeaderCellDef>Options</mat-header-cell>
          <mat-cell *matCellDef="let row">{{ row.options.length }}</mat-cell>
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
    .header-actions { display: flex; gap: 16px; align-items: center; }
    .type-filter { width: 160px; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; color: #888; padding: 40px; }
    mat-table { width: 100%; }
  `,
})
export class TariffListPage implements OnInit {
  readonly router = inject(Router);
  private readonly getTariffs = inject(GetTariffsUseCase);
  private readonly deleteTariff = inject(DeleteTariffUseCase);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['name', 'type', 'options', 'actions'];
  readonly pageSize = 20;
  readonly loading = signal(false);
  readonly items = signal<TariffEntity[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  typeFilter = '';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const params = {
      page: this.pageIndex(),
      limit: this.pageSize,
      ...(this.typeFilter ? { type: this.typeFilter as 'leasing' | 'subscription' } : {}),
    };
    this.getTariffs.execute(params).subscribe({
      next: ({ items, total }) => {
        this.items.set(items);
        this.total.set(total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.load();
  }

  edit(tariff: TariffEntity): void {
    this.router.navigate(['/tariffs', tariff.id, 'edit']);
  }

  delete(tariff: TariffEntity): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Tariff', message: `Delete "${tariff.name}"?`, confirmLabel: 'Delete' },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTariff.execute(tariff.id).subscribe(() => this.load());
      }
    });
  }
}
