import express from 'express';

import {
  getHistoryRoute,
  getSearchFlightsRoute,
  getSearchProfilesRoute,
  getAutocomplete,
  getStatus,
} from './controllers';

const routes = function(store) {

  let router = express.Router();

  router.get('/history', getHistoryRoute(store));

  router.get('/searchFlights', getSearchFlightsRoute(store));
  router.get('/searchProfiles', getSearchProfilesRoute(store));

  router.get('/getState', getStateController(store));

  router.get('/autocomplete', getAutocomplete(store));

  router.get('/status', getStatus(store));

  return router;
};

function getStateController(store) {
  return (req, res, next) => {
    res.send(store.getState());
  };
}

export default routes;
