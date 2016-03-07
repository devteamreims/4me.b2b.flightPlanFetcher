import _ from 'lodash';

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