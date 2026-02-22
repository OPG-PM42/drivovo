'use client';

import { PropsWithChildren, createContext, useContext } from 'react';
import { makeObservable, observable, action, computed } from 'mobx';
import appState, { type AppState } from '@/states';

const annotationMap: Record<string, any> = {
  observable,
  computed,
  effect: action,
}
 
function createAnnotations(metadata: Record<string, string>) {
  const annotations: Record<string, any> = {};
  const annotationsEntries = Object.entries(metadata);
  for (const [propertyName, annotation] of annotationsEntries) {
    annotations[propertyName] = annotationMap[annotation];
  }
  return annotations;
}

function makeStateObservable<S extends object>(state: S) {
  const viewModels = Object.values(state);
  for (const viewModel of viewModels) {
    const { metadata } = viewModel.constructor;
    makeObservable(viewModel, createAnnotations(metadata));
  }
}

makeStateObservable(appState);

const StateContext = createContext<AppState>(appState);
 
export function StateProvider({ children }: PropsWithChildren) {
  return (
    <StateContext.Provider value={appState}>
      {children}
    </StateContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
}