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
import { TariffEntity } from '../../../domain/tariff';
import { GetTariffsUseCase } from '../../../application/use-cases/get-tariffs.use-case';
import { DeleteTariffUseCase } from '../../../application/use-cases/delete-tariff.use-case';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog.service';

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
  templateUrl: './tariff-list.page.html',
  styleUrl: './tariff-list.page.scss',
})
export class TariffListPage implements OnInit {
  readonly router = inject(Router);
  private readonly getTariffs = inject(GetTariffsUseCase);
  private readonly deleteTariff = inject(DeleteTariffUseCase);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly columns = ['name', 'type', 'options', 'actions'];
  readonly pageSize = 20;
  readonly loading = signal(false);
  readonly items = signal<TariffEntity[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  typeFilter: '' | TariffEntity['type'] = '';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const params = {
      page: this.pageIndex(),
      limit: this.pageSize,
      ...(this.typeFilter ? { type: this.typeFilter } : {}),
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
    this.confirmDialog
      .confirm({
        title: 'Delete Tariff',
        message: `Delete "${tariff.name}"?`,
        confirmLabel: 'Delete',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deleteTariff.execute(tariff.id).subscribe(() => this.load());
        }
      });
  }
}
