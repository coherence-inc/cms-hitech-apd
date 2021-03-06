import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import activities from './activities';
import apd from './apd';
import auth from './auth';
import budget from './budget';
import notification from './notification';
import sidebar from './sidebar';
import state from './state';
import user from './user';

const rootReducer = combineReducers({
  activities,
  apd,
  auth,
  budget,
  notification,
  sidebar,
  state,
  user,
  router: routerReducer
});

export default rootReducer;
