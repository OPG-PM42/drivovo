'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useAppState } from '@/ui/providers/state';

function App() {
  const { cars } = useAppState();

  useEffect(() => {
    cars.fetchCars().then(() => console.log(cars));
    return () => cars.dispose();
  }, [cars]);
  
  return (
    <div>
      {cars.loading ? <div>Loading...</div> : <div>Cars length: {cars.list.length}</div>}
      <hr />
      <button onClick={() => cars.addCar({ id: cars.list.length + 1 })}>Add Car</button>
    </div>
  );
}

export default observer(App);