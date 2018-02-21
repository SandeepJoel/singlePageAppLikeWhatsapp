export class StateLoader {
  loadState() {
      try {
          let serializedState = localStorage.getItem('mainState');

          if (serializedState === null) {
              return this.initializeState();
          }

          return JSON.parse(serializedState);
      }
      catch (err) {
          return this.initializeState();
      }
  }

  saveState(state) {
      try {
          let serializedState = JSON.stringify(state);
          localStorage.setItem('mainState', serializedState);
      }
      catch (err) {
      }
  }

  initializeState() {
    // Initial application state of the app is here...
    return {
      loggedUser: ''
    }
  };
}
