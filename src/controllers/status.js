import {
  getClients,
} from '../selectors/socket';

import {
  getRaw,
  getAutocomplete,
  getFlightRequest,
  getFlightPlanRequest,
} from '../selectors/status';

export function getStatus(store) {
  return (req, res, next) => {
    const socketClients = getClients(store.getState());

    const autocompleteStatus = getAutocomplete(store.getState());
    const flightRequestStatus = getFlightRequest(store.getState());
    const flightPlanRequestStatus = getFlightPlanRequest(store.getState());

    const raw = getRaw(store.getState());

    res.send({
      socketClients,
      autocompleteStatus,
      flightRequestStatus,
      flightPlanRequestStatus,
      version: process.env.npm_package_version,
      raw,
    });
  };
}
