import moment from 'moment';
const b2bTimeFormat = 'YYYY-MM-DD HH:mm';
const b2bTimeFormatWithSeconds = b2bTimeFormat + ':ss';



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

  return soapEnvelope(`
    <flight:FlightPlanListRequest xmlns:flight="eurocontrol/cfmu/b2b/FlightServices" xmlns:common="eurocontrol/cfmu/b2b/CommonServices" xmlns:airspace="eurocontrol/cfmu/b2b/AirspaceServices" xmlns:flow="eurocontrol/cfmu/b2b/FlowServices">
      ${query}
    </flight:FlightPlanListRequest>
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
    <requestedFlightFields>delay</requestedFlightFields>
  `);

  return soapEnvelope(`
    <flight:FlightRetrievalRequest>
      ${query}
    </flight:FlightRetrievalRequest>
  `);
}

function soapEnvelope(content) {
  return `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:flight="eurocontrol/cfmu/b2b/FlightServices">
      <soap:Header></soap:Header>
      <soap:Body>
        ${content}
      </soap:Body>
    </soap:Envelope>
  `;
}