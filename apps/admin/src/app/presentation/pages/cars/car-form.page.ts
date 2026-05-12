import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { carCreateSchema } from '@drivovo/domain';
import { HasDirtyForm } from '../../guards/dirty-form.guard';
import { ImageArrayEditorComponent } from '../../shared/forms/image-array-editor.component';
import { GetCarByIdUseCase } from '../../../application/use-cases/get-car-by-id.use-case';
import { CreateCarUseCase } from '../../../application/use-cases/create-car.use-case';
import { UpdateCarUseCase } from '../../../application/use-cases/update-car.use-case';

@Component({
  selector: 'app-car-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ImageArrayEditorComponent,
  ],
  template: `
    <div class="page-header">
      <h1>{{ isEdit ? 'Edit Car' : 'New Car' }}</h1>
    </div>

    @if (loadingCar()) {
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
                <mat-label>Brand</mat-label>
                <input matInput formControlName="brand" />
                @if (form.controls.brand.invalid && form.controls.brand.touched) {
                  <mat-error>Brand is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Drive Type</mat-label>
                <mat-select formControlName="driveType">
                  <mat-option value="FWD">FWD</mat-option>
                  <mat-option value="RWD">RWD</mat-option>
                  <mat-option value="AWD">AWD</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Car Type</mat-label>
                <mat-select formControlName="type">
                  @for (t of carTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="available">Available</mat-option>
                  <mat-option value="order">Order</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Engine Type</mat-label>
                <mat-select formControlName="engineType">
                  @for (t of engineTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Engine Capacity</mat-label>
                <input matInput formControlName="engineCapacity" placeholder="e.g. 2.0L" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fuel Consumption</mat-label>
                <input matInput formControlName="engineFuelCons" placeholder="e.g. 7.5L/100km" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Color</mat-label>
                <input matInput formControlName="color" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Interior Trim</mat-label>
                <input matInput formControlName="interiorTrim" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Power</mat-label>
                <input matInput formControlName="power" placeholder="e.g. 150hp" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Acceleration (0-100)</mat-label>
                <input matInput formControlName="acceleration" placeholder="e.g. 8.5s" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL</mat-label>
                <input matInput formControlName="url" />
              </mat-form-field>
            </div>

            <app-image-array-editor
              [formArray]="imagesArray"
              (addRow)="addImage()"
            />

            @if (apiError()) {
              <p class="error-message">{{ apiError() }}</p>
            }

            <div class="form-actions">
              <button mat-button type="button" (click)="router.navigate(['/cars'])">Cancel</button>
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
    .full-width { grid-column: span 2; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .error-message { color: #c62828; }
  `,
})
export class CarFormPage implements OnInit, HasDirtyForm {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly getCarById = inject(GetCarByIdUseCase);
  private readonly createCar = inject(CreateCarUseCase);
  private readonly updateCar = inject(UpdateCarUseCase);

  readonly carTypes = ['sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other'];
  readonly engineTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'other'];

  readonly loadingCar = signal(false);
  readonly saving = signal(false);
  readonly apiError = signal('');

  readonly form = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    description: [''],
    driveType: ['FWD', Validators.required],
    type: ['sedan', Validators.required],
    status: ['available', Validators.required],
    engineType: ['petrol', Validators.required],
    engineCapacity: [null as string | null],
    engineFuelCons: [null as string | null],
    color: [null as string | null],
    interiorTrim: [null as string | null],
    power: [null as string | null],
    acceleration: [null as string | null],
    url: [null as string | null],
    images: this.fb.array<FormGroup>([]),
  });

  get imagesArray() {
    return this.form.controls.images;
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
      this.loadingCar.set(true);
      this.getCarById.execute(id).subscribe({
        next: (car) => {
          this.form.patchValue({
            name: car.name,
            brand: car.brand,
            description: car.description,
            driveType: car.driveType,
            type: car.type,
            status: car.status,
            engineType: car.engine.type,
            engineCapacity: car.engine.capacity,
            engineFuelCons: car.engine.fuel_consumption,
            color: car.color,
            interiorTrim: car.interiorTrim,
            power: car.power,
            acceleration: car.acceleration,
            url: car.url,
          });
          car.images.forEach((img) => this.imagesArray.push(this.buildImageGroup(img)));
          this.loadingCar.set(false);
        },
        error: () => this.loadingCar.set(false),
      });
    }
  }

  addImage(): void {
    this.imagesArray.push(this.buildImageGroup({ url: '', alt: null, width: 0, height: 0 }));
  }

  private buildImageGroup(img: { url: string; alt: string | null; width: number; height: number }): FormGroup {
    return this.fb.group({
      url: [img.url, Validators.required],
      alt: [img.alt],
      width: [img.width, Validators.required],
      height: [img.height, Validators.required],
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
      images: raw.images.map((img: Record<string, unknown>) => ({
        ...img,
        width: Number(img['width']) || 0,
        height: Number(img['height']) || 0,
        alt: img['alt'] || null,
      })),
    };
    const parsed = carCreateSchema.safeParse(coerced);
    if (!parsed.success) {
      this.apiError.set('Validation failed: ' + parsed.error.issues.map((i) => i.message).join(', '));
      return;
    }

    this.saving.set(true);
    this.apiError.set('');
    const id = this.route.snapshot.params['id'];
    const op$ = id
      ? this.updateCar.execute(id, parsed.data)
      : this.createCar.execute(parsed.data);

    op$.subscribe({
      next: () => {
        this.form.markAsPristine();
        this.router.navigate(['/cars']);
      },
      error: (err) => {
        this.saving.set(false);
        this.apiError.set(err.error?.message ?? 'Save failed');
      },
    });
  }
}
