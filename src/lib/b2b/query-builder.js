import moment from 'moment';
import _ from 'lodash';

const b2bTimeFormat = 'YYYY-MM-DD HH:mm';
const b2bDateFormat = 'YYYY-MM-DD';
const b2bTimeFormatWithSeconds = b2bTimeFormat + ':ss';

const b2bFormatDuration = (str) => _.padStart(_.take(`${str}`, 4).join(''), 4, '0');


export function queryCompleteAIXMDataset() {
  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);
  const wef = moment.utc().subtract(28, 'days').format(b2bDateFormat);
  const unt = moment.utc(sendTime).format(b2bDateFormat);

  const query = `
    <air:CompleteAIXMDatasetRequest>
      <sendTime>${sendTime}</sendTime>
      <queryCriteria>
        <publicationPeriod>
          <wef>${wef}</wef>
          <unt>${unt}</unt>
        </publicationPeriod>
      </queryCriteria>
    </air:CompleteAIXMDatasetRequest>
  `;

  return airspaceServiceSoapEnvelope(query);
}

export function queryInTrafficVolume(trafficVolume = 'LFERMS', options = {}) {

  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const wef = moment.utc().subtract(10, 'minutes').format(b2bTimeFormat);
  const unt = moment.utc().add(20, 'minutes').format(b2bTimeFormat);

  const duration = b2bFormatDuration(_.get(options, 'duration', 11));
  const step = b2bFormatDuration(_.get(options, 'step', 1));

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
     <trafficVolume>${trafficVolume}</trafficVolume>
  `);

  return flightSoapEnvelope(`
    <flig:FlightListByTrafficVolumeRequest>
      ${query}
    </flig:FlightListByTrafficVolumeRequest>
  `);
}

export function queryInAirspace(airspace = 'LFEERMS', options = {}) {

  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const wef = moment.utc().subtract(10, 'minutes').format(b2bTimeFormat);
  const unt = moment.utc().add(20, 'minutes').format(b2bTimeFormat);

  const duration = b2bFormatDuration(_.get(options, 'duration', 11));
  const step = b2bFormatDuration(_.get(options, 'step', 1));

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

export function queryFlightPlans(callsign, options = {}) {
  if(callsign === undefined) {
    throw new Error('Callsign cannot be undefined !');
  }

  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const wef = moment.utc().subtract(12, 'hours').format(b2bTimeFormat);
  const unt = moment.utc().add(12, 'hours').format(b2bTimeFormat);

  const query = (`
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
      ${query}
    </flig:FlightPlanListRequest>
  `);
}

export function flightKeysFromIfplId(ifplId, options = {}) {
  if(!ifplId) {
    throw new Error('ifplId cannot be undefined !');
  }

  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);

  const query = (`
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
      ${query}
    </flig:FlightRetrievalRequest>
  `);
}

export function retrieveFlight(callsign, dep, dest, eobt, options = {}) {

  const sendTime = moment.utc().format(b2bTimeFormatWithSeconds);
  const formattedEobt = moment.utc(eobt).format(b2bTimeFormat);
/*
         <sendTime>2013-03-01 16:46:00</sendTime>
         <dataset>
            <type>OPERATIONAL</type>
         </dataset>
         <includeProposalFlights>false</includeProposalFlights>
         <flightId>
            <!--You have a CHOICE of the next 2 items at this level-->
            <keys>
            <aircraftId>PHACE</aircraftId>
            <aerodromeOfDeparture>EHGG</aerodromeOfDeparture>
            <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
            <airFiled>false</airFiled>
            <aerodromeOfDestination>LSGG</aerodromeOfDestination>
            <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
            <estimatedOffBlockTime>2016-03-07 07:15</estimatedOffBlockTime>
            </keys>
         </flightId>
         <!--Zero or more repetitions:-->
         <requestedFlightDatasets>flight</requestedFlightDatasets>
         <!--Zero or more repetitions:-->
         <requestedFlightFields>ctfmPointProfile</requestedFlightFields>
         <requestedFlightFields>ftfmPointProfile</requestedFlightFields>
    */


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
        <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
        <airFiled>false</airFiled>
        <aerodromeOfDestination>${dest}</aerodromeOfDestination>
        <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
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

function flightSoapEnvelope(content) {
  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:flig="eurocontrol/cfmu/b2b/FlightServices">
      <soapenv:Header/>
      <soapenv:Body>
        ${content}
      </soapenv:Body>
    </soapenv:Envelope>
  `;
}

function airspaceServiceSoapEnvelope(content) {
  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:air="eurocontrol/cfmu/b2b/AirspaceServices">
      <soapenv:Header/>
      <soapenv:Body>
        ${content}
      </soapenv:Body>
    </soapenv:Envelope>
  `;
}
