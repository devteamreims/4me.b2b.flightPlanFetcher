import _ from 'lodash';
import moment from 'moment';

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