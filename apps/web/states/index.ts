import { type CarViewModel, CarViewModelImpl } from "./car";

export interface AppState {
  cars: CarViewModel;
}

const mockCarService = {
  getAll: async () => {
    return [{ id: 1 }, { id: 2 }, { id: 3 }];
  },
}

export default {
  cars: new CarViewModelImpl(mockCarService),
} as AppState;