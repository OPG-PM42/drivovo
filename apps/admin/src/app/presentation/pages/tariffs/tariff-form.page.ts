import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { tariffCreateSchema } from '@drivovo/domain';
import { HasDirtyForm } from '../../guards/dirty-form.guard';
import { GetTariffByIdUseCase } from '../../../application/use-cases/get-tariff-by-id.use-case';
import { CreateTariffUseCase } from '../../../application/use-cases/create-tariff.use-case';
import { UpdateTariffUseCase } from '../../../application/use-cases/update-tariff.use-case';

@Component({
  selector: 'app-tariff-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-header">
      <h1>{{ isEdit ? 'Edit Tariff' : 'New Tariff' }}</h1>
    </div>

    @if (loadingTariff()) {
      <div class="center"><mat-spinner /></div>
    } @else {
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
                @if (form.controls.name.invalid && form.controls.name.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="leasing">Leasing</mat-option>
                  <mat-option value="subscription">Subscription</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="options-section">
              <div class="options-header">
                <strong>Options</strong>
                <button mat-stroked-button type="button" (click)="addOption()">
                  <mat-icon>add</mat-icon> Add Option
                </button>
              </div>

              @for (group of optionsArray.controls; track $index) {
                <div class="option-row" [formGroup]="group">
                  <mat-form-field appearance="outline">
                    <mat-label>Name</mat-label>
                    <input matInput formControlName="name" />
                  </mat-form-field>

                  <ng-container formGroupName="price">
                    <mat-form-field appearance="outline" class="small-field">
                      <mat-label>Price</mat-label>
                      <input matInput type="number" formControlName="value" />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="small-field">
                      <mat-label>Currency</mat-label>
                      <input matInput formControlName="currency" placeholder="USD" />
                    </mat-form-field>
                  </ng-container>

                  <mat-form-field appearance="outline">
                    <mat-label>Car ID (optional)</mat-label>
                    <input matInput formControlName="carId" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Country ID (optional)</mat-label>
                    <input matInput formControlName="countryId" />
                  </mat-form-field>

                  <button mat-icon-button type="button" color="warn" (click)="optionsArray.removeAt($index)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            @if (apiError()) {
              <p class="error-message">{{ apiError() }}</p>
            }

            <div class="form-actions">
              <button mat-button type="button" (click)="router.navigate(['/tariffs'])">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) { <mat-spinner diameter="18" /> } @else { Save }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    .page-header { margin-bottom: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .options-section { margin-top: 16px; }
    .options-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .option-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
    .small-field { width: 100px; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .error-message { color: #c62828; }
  `,
})
export class TariffFormPage implements OnInit, HasDirtyForm {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly getTariffById = inject(GetTariffByIdUseCase);
  private readonly createTariff = inject(CreateTariffUseCase);
  private readonly updateTariff = inject(UpdateTariffUseCase);

  readonly loadingTariff = signal(false);
  readonly saving = signal(false);
  readonly apiError = signal('');

  readonly form = this.fb.group({
    name: ['', Validators.required],
    type: ['leasing' as 'leasing' | 'subscription', Validators.required],
    options: this.fb.array<FormGroup>([]),
  });

  get optionsArray() {
    return this.form.controls.options;
  }

  get isEdit(): boolean {
    return !!this.route.snapshot.params['id'];
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadingTariff.set(true);
      this.getTariffById.execute(id).subscribe({
        next: (tariff) => {
          this.form.patchValue({ name: tariff.name, type: tariff.type });
          tariff.options.forEach((opt) => this.optionsArray.push(this.buildOptionGroup(opt)));
          this.loadingTariff.set(false);
        },
        error: () => this.loadingTariff.set(false),
      });
    }
  }

  addOption(): void {
    this.optionsArray.push(
      this.buildOptionGroup({ name: '', price: { value: 0, currency: 'USD' } }),
    );
  }

  private buildOptionGroup(opt: {
    name: string;
    price: { value: number; currency: string };
    carId?: string;
    countryId?: string;
  }): FormGroup {
    return this.fb.group({
      name: [opt.name, Validators.required],
      price: this.fb.group({
        value: [opt.price.value, [Validators.required, Validators.min(0)]],
        currency: [opt.price.currency, Validators.required],
      }),
      carId: [opt.carId ?? null],
      countryId: [opt.countryId ?? null],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const coerced = {
      ...raw,
      options: raw.options.map((opt: Record<string, unknown>) => {
        const price = opt['price'] as Record<string, unknown>;
        return {
          name: opt['name'],
          price: { value: Number(price['value']) || 0, currency: price['currency'] },
          ...(opt['carId'] ? { carId: opt['carId'] } : {}),
          ...(opt['countryId'] ? { countryId: opt['countryId'] } : {}),
        };
      }),
    };
    const parsed = tariffCreateSchema.safeParse(coerced);
    if (!parsed.success) {
      this.apiError.set('Validation failed: ' + parsed.error.issues.map((i) => i.message).join(', '));
      return;
    }

    this.saving.set(true);
    this.apiError.set('');
    const id = this.route.snapshot.params['id'];
    const op$ = id
      ? this.updateTariff.execute(id, parsed.data)
      : this.createTariff.execute(parsed.data);

    op$.subscribe({
      next: () => {
        this.form.markAsPristine();
        this.router.navigate(['/tariffs']);
      },
      error: (err) => {
        this.saving.set(false);
        this.apiError.set(err.error?.message ?? 'Save failed');
      },
    });
  }
}
