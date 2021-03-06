import NoMatch from './components/NoMatch';
import ApdApplication from './containers/ApdApplication';
import Login from './containers/Login';

import Landing from './containers/Landing';
import StateDash from './components/StateDash';

// temp pages for more targeted development & iteration
import MiscPage from './components/temp/MiscPage';

const routes = [
  { path: '/', component: Landing, exact: true, nonPrivate: false },
  { path: '/apd', component: ApdApplication, exact: true, nonPrivate: false },
  { path: '/login', component: Login, nonPrivate: true },
  { path: '/dash', component: StateDash, nonPrivate: true },

  { path: '/temp/misc', component: MiscPage, nonPrivate: true },

  { component: NoMatch, nonPrivate: true }
];

export default routes;
