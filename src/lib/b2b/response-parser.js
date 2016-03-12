import _ from 'lodash';
import moment from 'moment';

import d from 'debug';
const debug = d('4me.lib.b2b.response-parser');

export function parseFlightPlanListReply(input) {

  const reply = _.get(input, 'flight:FlightPlanListReply', {});

  const status = _.get(reply, 'status');

  if(status !== 'OK') {
    throw _.get(reply, 'inputValidationErrors');
  }

  const body = _.get(reply, 'data');

  return {
    status,
    body
  };

}

export function parsePoint(point) {
  const timeOver = moment.utc(_.get(point, 'timeOver'), null);

  const flightLevel = _.get(point, 'flightLevel.level', 0);

  const name = _.get(point, 'point.pointId', '');

  const trend = _.get(point, 'exitTrend', 'CRUISE');

  return {
    timeOver,
    flightLevel,
    name,
    trend
  };
}

export function nonVectorPoint(point) {
  return _.get(point, 'flightPlanPoint', false) === 'true';
}

export function parseFlightRetrievalReply(input) {

  const reply = _.get(input, 'flight:FlightRetrievalReply', {});

  const status = _.get(reply, 'status');

  if(status !== 'OK') {
    throw _.get(reply, 'inputValidationErrors');
  }

  const body = _.get(reply, 'data');

  return {
    status,
    body
  };

}

export function normalizeFlightPlan(flightPlan) {
  const ifplId = _.get(flightPlan, 'id');
  const callsign = _.get(flightPlan, 'keys.aircraftId');
  const departure = _.get(flightPlan, 'keys.aerodromeOfDeparture');
  const destination = _.get(flightPlan, 'keys.aerodromeOfDestination');
  const eobt = _.get(flightPlan, 'keys.estimatedOffBlockTime');

  const flight = {
    ifplId,
    callsign,
    departure,
    destination,
    eobt
  };

  return flight;
}

export function flightPlanToKeys(flightPlan) {
  //debug(flightPlan);
  const departure = _.get(flightPlan, 'aerodromeOfDeparture.icaoId');
  const destination = _.get(flightPlan, 'aerodromesOfDestination.aerodromeOfDestination.icaoId');
  const callsign = _.get(flightPlan, 'aircraftId.aircraftId');
  const eobt = _.get(flightPlan, 'estimatedOffBlockTime');

  return {
    callsign,
    departure,
    destination,
    eobt,
  };
}
