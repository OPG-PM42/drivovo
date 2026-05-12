import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiForm } from '@taiga-ui/layout';
import { carCreateSchema } from '@drivovo/domain';
import { HasDirtyForm } from '../../guards/dirty-form.guard';
import { ImageArrayEditorComponent, ImageFormControls } from '../../shared/forms/image-array-editor.component';
import { GetCarByIdUseCase } from '../../../application/use-cases/get-car-by-id.use-case';
import { CreateCarUseCase } from '../../../application/use-cases/create-car.use-case';
import { UpdateCarUseCase } from '../../../application/use-cases/update-car.use-case';

@Component({
  selector: 'app-car-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiButton,
    ...TuiError,
    TuiLoader,
    TuiTextfield,
    ...TuiSelect,
    TuiTextarea,
    TuiForm,
    ImageArrayEditorComponent,
  ],
  templateUrl: './car-form.page.html',
  styleUrl: './car-form.page.scss',
})
export class CarFormPage implements OnInit, HasDirtyForm {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly getCarById = inject(GetCarByIdUseCase);
  private readonly createCar = inject(CreateCarUseCase);
  private readonly updateCar = inject(UpdateCarUseCase);

  readonly driveTypes = ['FWD', 'RWD', 'AWD'];
  readonly carTypes = ['sedan', 'hatchback', 'suv', 'mpv', 'coupe', 'convertible', 'van', 'pickup', 'bus', 'other'];
  readonly statuses = ['available', 'order'];
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
    images: this.fb.array<FormGroup<ImageFormControls>>([]),
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

  private buildImageGroup(img: { url: string; alt: string | null; width: number; height: number }): FormGroup<ImageFormControls> {
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
      images: raw.images.map((img) => ({
        ...img,
        width: img.width ?? 0,
        height: img.height ?? 0,
        alt: img.alt ?? null,
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
