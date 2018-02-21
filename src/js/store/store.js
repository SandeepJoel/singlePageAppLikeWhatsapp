import { createStore }  from 'redux';
import { mainReducer } from '../reducers/index';
import { StateLoader } from './stateLoader';

// Initial application state of the app is in stateLoader.js

let stateLoaderInstance = new StateLoader();
// creating our redux store
export const store = createStore(mainReducer, stateLoaderInstance.loadState());

store.subscribe(() => {
  stateLoaderInstance.saveState(store.getState());
  console.log(store.getState());
});
