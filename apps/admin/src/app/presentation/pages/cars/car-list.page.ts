import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { CarEntity } from '../../../domain/car';
import { GetCarsUseCase } from '../../../application/use-cases/get-cars.use-case';
import { DeleteCarUseCase } from '../../../application/use-cases/delete-car.use-case';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog.service';

@Component({
  selector: 'app-car-list-page',
  standalone: true,
  imports: [
    TuiTable,
    TuiTablePagination,
    TuiButton,
    TuiLoader,
  ],
  template: `
    <div class="page-header">
      <h1>Cars</h1>
      <button tuiButton appearance="primary" iconStart="@tui.plus" (click)="router.navigate(['/cars/new'])">Add Car</button>
    </div>

    <tui-loader [loading]="loading()" [overlay]="true">
      @if (items().length === 0 && !loading()) {
        <p class="empty-state">No cars found.</p>
      } @else {
        <table tuiTable [columns]="columns">
          <thead>
            <tr tuiThGroup>
              <th *tuiHead="'name'" tuiTh>Name</th>
              <th *tuiHead="'brand'" tuiTh>Brand</th>
              <th *tuiHead="'type'" tuiTh>Type</th>
              <th *tuiHead="'status'" tuiTh>Status</th>
              <th *tuiHead="'actions'" tuiTh></th>
            </tr>
          </thead>
          <tbody tuiTbody>
            @for (row of items(); track row.id) {
              <tr tuiTr>
                <td *tuiCell="'name'" tuiTd>{{ row.name }}</td>
                <td *tuiCell="'brand'" tuiTd>{{ row.brand }}</td>
                <td *tuiCell="'type'" tuiTd>{{ row.type }}</td>
                <td *tuiCell="'status'" tuiTd>{{ row.status }}</td>
                <td *tuiCell="'actions'" tuiTd>
                  <button tuiIconButton iconStart="@tui.pencil" appearance="flat" (click)="edit(row)"></button>
                  <button tuiIconButton iconStart="@tui.trash" appearance="flat" (click)="delete(row)"></button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <tui-table-pagination
          [items]="sizeOptions"
          [total]="total()"
          [page]="pageIndex()"
          [size]="pageSize()"
          (paginationChange)="onPagination($event)"
        />
      }
    </tui-loader>
  `,
  styles: `
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .empty-state { text-align: center; color: #888; padding: 40px; }
    table { width: 100%; }
  `,
})
export class CarListPage implements OnInit {
  readonly router = inject(Router);
  private readonly getCars = inject(GetCarsUseCase);
  private readonly deleteCar = inject(DeleteCarUseCase);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly columns = ['name', 'brand', 'type', 'status', 'actions'];
  readonly sizeOptions = [10, 20, 50] as const;
  readonly loading = signal(false);
  readonly items = signal<CarEntity[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.getCars.execute({ page: this.pageIndex(), limit: this.pageSize() }).subscribe({
      next: ({ items, total }) => {
        this.items.set(items);
        this.total.set(total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPagination(event: TuiTablePaginationEvent): void {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
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
