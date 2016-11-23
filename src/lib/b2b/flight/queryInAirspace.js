import moment from 'moment';
import R from 'ramda';

import invariant from 'invariant';

import {
  b2bFormatDuration,
  b2bTimeFormatWithSeconds,
  b2bTimeFormat,
  flightSoapEnvelope,
  parseXML,
  unfoldSoapEnvelope,
  B2BError,
} from '../utils';

export function query(airspace = 'LFEERMS', options = {}) {
  invariant(
    typeof airspace === 'string',
    'Argument error: airspace should be a string',
  );

  invariant(
    typeof options === 'object',
    'Argument error: options should be an object',
  );

  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const wef = moment.utc().subtract(10, 'minutes').format(b2bTimeFormat);
  const unt = moment.utc().add(20, 'minutes').format(b2bTimeFormat);

  const duration = b2bFormatDuration(R.propOr(11, 'duration', options));
  const step = b2bFormatDuration(R.propOr(1, 'step', options));

  const query = (`
     <sendTime>${sendTime}</sendTime>
     <dataset>
        <type>OPERATIONAL</type>
     </dataset>
     <includeProposalFlights>false</includeProposalFlights>
     <trafficType>LOAD</trafficType>
     <trafficWindow>
        <wef>${wef}</wef>
        <unt>${unt}</unt>
     </trafficWindow>
     <countsInterval>
        <duration>${duration}</duration>
        <step>${step}</step>
     </countsInterval>
     <!--Optional:-->
     <calculationType>OCCUPANCY</calculationType>
     <airspace>${airspace}</airspace>
  `);

  return flightSoapEnvelope(`
    <flig:FlightListByAirspaceRequest>
      ${query}
    </flig:FlightListByAirspaceRequest>
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
    R.prop('flight:FlightListByAirspaceReply'),
    // Check B2B response status, throw if different than 'OK'
    checkResponseStatus,
  )(rawResponse);
}
