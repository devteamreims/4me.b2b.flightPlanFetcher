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
  B2BErrorNotFound,
} from '../utils';

export function retrieveByIfplId(ifplId, options = {}) {
  invariant(
    ifplId && typeof ifplId === 'string',
    'Argument error: ifplId should be a string',
  );

  invariant(
    typeof options === 'object',
    'Argument error: options should be an object',
  );


  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const payload = (`
    <sendTime>${sendTime}</sendTime>
    <dataset>
      <type>OPERATIONAL</type>
    </dataset>
    <includeProposalFlights>false</includeProposalFlights>
    <flightId>
      <id>${ifplId}</id>
    </flightId>
    <requestedFlightDatasets>flightPlan</requestedFlightDatasets>
  `);

  return flightSoapEnvelope(`
    <flig:FlightRetrievalRequest>
      ${payload}
    </flig:FlightRetrievalRequest>
  `);
}

export function retrieveByKeys(callsign, dep, dest, eobt, options = {}) {
  invariant(
    callsign && typeof callsign === 'string',
    'Argument error: callsign should be a string',
  );

  invariant(
    eobt &&
    typeof eobt === 'string' &&
    eobt.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/),
    'Argument error: eobt should be a string',
  );

  invariant(
    dest && typeof dest === 'string',
    'Argument error: dest should be a string',
  );

  invariant(
    dep && typeof dep === 'string',
    'Argument error: dep should be a string',
  );


  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);
  const formattedEobt = moment.utc(eobt).format(b2bTimeFormat);


  const query = (`
    <sendTime>${sendTime}</sendTime>
    <dataset>
      <type>OPERATIONAL</type>
    </dataset>
    <includeProposalFlights>false</includeProposalFlights>
    <flightId>
      <keys>
        <aircraftId>${callsign.toUpperCase()}</aircraftId>
        <aerodromeOfDeparture>${dep}</aerodromeOfDeparture>
        <airFiled>false</airFiled>
        <aerodromeOfDestination>${dest}</aerodromeOfDestination>
        <estimatedOffBlockTime>${formattedEobt}</estimatedOffBlockTime>
      </keys>
    </flightId>
    <requestedFlightDatasets>flight</requestedFlightDatasets>
    <requestedFlightFields>ftfmPointProfile</requestedFlightFields>
    <requestedFlightFields>rtfmPointProfile</requestedFlightFields>
    <requestedFlightFields>ftfmAirspaceProfile</requestedFlightFields>
    <requestedFlightFields>rtfmAirspaceProfile</requestedFlightFields>
    <requestedFlightFields>delay</requestedFlightFields>
    <requestedFlightFields>aircraftType</requestedFlightFields>
  `);

  return flightSoapEnvelope(`
    <flig:FlightRetrievalRequest>
      ${query}
    </flig:FlightRetrievalRequest>
  `);
}


export function parseResponse(rawResponse) {
  const checkResponseStatus = b2bResponse => {
    const status = R.propOr('UNKNOWN', 'status', b2bResponse);

    if(status === 'OBJECT_NOT_FOUND') {
      throw new B2BErrorNotFound();
    } else if(status !== 'OK') {
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
    R.prop('flight:FlightRetrievalReply'),
    // Check B2B response status, throw if different than 'OK'
    checkResponseStatus,
  )(rawResponse);
}
