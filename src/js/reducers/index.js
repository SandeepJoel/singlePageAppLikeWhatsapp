export function mainReducer (state, action) {
  switch(action.type){
    case 'USER_LOGIN_SUCCESS': {
      return {
        ...state,
        loggedUser: action.loggedUser
      }
    }
    case 'WAITING_FOR_RESPONSE': {
      return state;
    }
    case 'LOG_OUT': {
      return {
        ...state,
        loggedUser: ''
      }
    }
    default:
      return state;
  }
}
