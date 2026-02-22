import { runInAction } from 'mobx';

type Car = {
  id: number;
}

type Filter = {
  model: string;
  brand: string;
  engineType: 'ev' | 'gas' | 'hybrid' | 'all';
}

export interface CarViewModel {
  list: Car[];
  loading: boolean;
  filters: Filter;
  fetchCars(): Promise<void>;
  addCar(car: Car): void;
  updateFilter(param: string, value: string): void;
  dispose(): void;
}

const metadata = {
  list: 'observable',
  loading: 'observable',
  filters: 'observable',
  fetchCars: 'effect',
  updateFilter: 'effect',
  dispose: 'effect'
}

export class CarViewModelImpl implements CarViewModel {
  static metadata = metadata;

  list: Car[] = [];
  loading = false;
  filters: Filter = {
    model: '',
    brand: '',
    engineType: 'all'
  }
  
  constructor(private carService: any) {}

  async fetchCars() {
    try {
      this.loading = true;
      this.list = await this.carService.getAll(this.filters);
    } catch(e) {
      // notifications.error(e.message)
    } finally {
      this.loading = false;
    }
  }

  addCar(car: Car) {
    this.list.push(car);
  }

  updateFilter<N extends keyof Filter>(filterName: N, value: Filter[N]) {
    this.filters[filterName] = value;
  }

  dispose() {
    this.list = [];
    this.loading = false;
    this.filters = {
      model: '',
      brand: '',
      engineType: 'all'
    }
  }
}