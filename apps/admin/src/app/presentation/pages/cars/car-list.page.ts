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
  templateUrl: './car-list.page.html',
  styleUrl: './car-list.page.scss',
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
