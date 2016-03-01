import express from 'express';

import {
  getHistoryRoute,
  getSearchFlightsRoute,
  getSearchProfilesRoute,
  getSoapRoute
} from './controller';

const routes = function(store) {

  let router = express.Router();

  router.get('/history', getHistoryRoute(store));

  router.get('/searchFlights', getSearchFlightsRoute(store));
  router.get('/searchProfiles', getSearchProfilesRoute(store));

  router.get('/soap', getSoapRoute(store));

  router.get('/getState', getStateController(store));

  return router;
};

function getStateController(store) {
  return (req, res, next) => {
    res.send(store.getState());
  };
}

export default routes;