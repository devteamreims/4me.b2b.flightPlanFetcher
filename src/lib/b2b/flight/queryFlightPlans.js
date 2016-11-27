import moment from 'moment';
import invariant from 'invariant';
import R from 'ramda';

import {
  b2bTimeFormatWithSeconds,
  b2bTimeFormat,
  flightSoapEnvelope,
  parseXML,
  unfoldSoapEnvelope,
  B2BError,
} from '../utils';

export function queryByCallsign(callsign, options = {}) {
  invariant(
    callsign && typeof callsign === 'string',
    'Argument error: callsign should be a string',
  );

  invariant(
    typeof options === 'object',
    'Argument error: options should be an object',
  );


  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const wef = moment.utc().subtract(12, 'hours').format(b2bTimeFormat);
  const unt = moment.utc().add(12, 'hours').format(b2bTimeFormat);

  const payload = (`
    <sendTime>${sendTime}</sendTime>
    <aircraftId>${callsign.toUpperCase()}</aircraftId>
    <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
    <airFiled>false</airFiled>
    <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
    <estimatedOffBlockTime>
      <wef>${wef}</wef>
      <unt>${unt}</unt>
    </estimatedOffBlockTime>
  `);

  return flightSoapEnvelope(`
    <flig:FlightPlanListRequest>
      ${payload}
    </flig:FlightPlanListRequest>
  `);
}

export function parseResponse(rawResponse) {
  const checkResponseStatus = b2bResponse => {
    const status = R.propOr('UNKNOWN', 'status', b2bResponse);
    if(status !== 'OK') {
      throw new B2BError(`Invalid response status : ${status}`, {b2bResponse});
    }

    return b2bResponse;
  };

  return R.pipeP(
    // Transform raw XML to JS
    parseXML,
    // Remove SOAP Envelope
    unfoldSoapEnvelope,
    // Extract specific response
    R.prop('flight:FlightPlanListReply'),
    // Check B2B response status, throw if different than 'OK'
    checkResponseStatus,
  )(rawResponse);
}
