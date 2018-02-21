import axios from 'axios';
import {store} from '../store/store';
export function loginHandler (username, password) {

  // async work to handle login submission
    axios.post('/api/login',{
      userName: username,
      password: password
    })
    .then((response) => {
      if(response.data.success) {
        store.dispatch ({
          type: 'USER_LOGIN_SUCCESS',
          loggedUser: username
        })
      }
    })
    .catch(function(error){
      throw error
    });

  return {
    type: 'WAITING_FOR_RESPONSE'
  }
}
export function logOut() {
  return {
    type: 'LOG_OUT'
  }
}
