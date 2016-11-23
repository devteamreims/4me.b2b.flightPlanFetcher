import {
  queryByCallsign,
  parseResponse,
} from './queryFlightPlans';

import MockDate from 'mockdate';

describe('queryFlightPlans', () => {
  describe('byCallsign builder', () => {
    // Our query build depends on the current time
    // MockDate allows snapshot testing by overriding global Date class
    beforeEach(() => {
      MockDate.set(1479898355004);
    });

    afterEach(() => {
      MockDate.reset();
    });

    test('should reject invalid arguments', () => {
      expect(() => queryByCallsign({})).toThrowErrorMatchingSnapshot();
      expect(() => queryByCallsign(null)).toThrowErrorMatchingSnapshot();
      expect(() => queryByCallsign('string', 'string')).toThrowErrorMatchingSnapshot();
    });

    test('should accept valid arguments', () => {
      expect(() => queryByCallsign('string')).not.toThrow();
      expect(() => queryByCallsign('string', {})).not.toThrow();
    });

    test('should accept a callsign as argument', () => {
      expect(queryByCallsign('AFR1234')).toMatch(/AFR1234/);
    });

    test('should match snapshot', () => {
      expect(queryByCallsign('AFR1234')).toMatchSnapshot();
    });
  });

  describe('response parser', () => {
    const exampleResponse = `
    <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
       <S:Body>
          <flight:FlightPlanListReply xmlns:flight="eurocontrol/cfmu/b2b/FlightServices" xmlns:common="eurocontrol/cfmu/b2b/CommonServices" xmlns:airspace="eurocontrol/cfmu/b2b/AirspaceServices" xmlns:flow="eurocontrol/cfmu/b2b/FlowServices">
             <requestReceptionTime>2016-11-23 15:05:27</requestReceptionTime>
             <requestId>B2B_CUR:2182940</requestId>
             <sendTime>2016-11-23 15:05:27</sendTime>
             <status>OK</status>
             <data>
                <summaries>
                   <lastValidFlightPlan>
                      <id>
                         <id>AA58790671</id>
                         <keys>
                            <aircraftId>AZA97U</aircraftId>
                            <aerodromeOfDeparture>LIRF</aerodromeOfDeparture>
                            <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                            <airFiled>false</airFiled>
                            <aerodromeOfDestination>EGLL</aerodromeOfDestination>
                            <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                            <estimatedOffBlockTime>2016-11-23 13:10</estimatedOffBlockTime>
                         </keys>
                      </id>
                      <status>AIRBORNE</status>
                   </lastValidFlightPlan>
                </summaries>
             </data>
          </flight:FlightPlanListReply>
       </S:Body>
    </S:Envelope>
    `;

    const emptyResponse = `
    <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
       <S:Body>
          <flight:FlightPlanListReply xmlns:flight="eurocontrol/cfmu/b2b/FlightServices" xmlns:common="eurocontrol/cfmu/b2b/CommonServices" xmlns:airspace="eurocontrol/cfmu/b2b/AirspaceServices" xmlns:flow="eurocontrol/cfmu/b2b/FlowServices">
             <requestReceptionTime>2016-11-23 15:10:57</requestReceptionTime>
             <requestId>B2B_CUR:2189520</requestId>
             <sendTime>2016-11-23 15:10:57</sendTime>
             <status>OK</status>
             <data/>
          </flight:FlightPlanListReply>
       </S:Body>
    </S:Envelope>
  `;

  const multipleReponse = `
  <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
     <S:Body>
        <flight:FlightPlanListReply xmlns:flight="eurocontrol/cfmu/b2b/FlightServices" xmlns:common="eurocontrol/cfmu/b2b/CommonServices" xmlns:airspace="eurocontrol/cfmu/b2b/AirspaceServices" xmlns:flow="eurocontrol/cfmu/b2b/FlowServices">
           <requestReceptionTime>2016-11-23 15:12:48</requestReceptionTime>
           <requestId>B2B_CUR:2191979</requestId>
           <sendTime>2016-11-23 15:13:01</sendTime>
           <status>OK</status>
           <data>
              <summaries>
                 <lastValidFlightPlan>
                    <id>
                       <id>AA58780893</id>
                       <keys>
                          <aircraftId>OEGMI</aircraftId>
                          <aerodromeOfDeparture>DAUA</aerodromeOfDeparture>
                          <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                          <airFiled>false</airFiled>
                          <aerodromeOfDestination>LEMD</aerodromeOfDestination>
                          <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                          <estimatedOffBlockTime>2016-11-23 09:00</estimatedOffBlockTime>
                       </keys>
                    </id>
                    <status>CLOSED</status>
                 </lastValidFlightPlan>
              </summaries>
              <summaries>
                 <lastValidFlightPlan>
                    <id>
                       <id>AA58783135</id>
                       <keys>
                          <aircraftId>OEGMI</aircraftId>
                          <aerodromeOfDeparture>LEMD</aerodromeOfDeparture>
                          <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                          <airFiled>false</airFiled>
                          <aerodromeOfDestination>LFSB</aerodromeOfDestination>
                          <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                          <estimatedOffBlockTime>2016-11-23 11:55</estimatedOffBlockTime>
                       </keys>
                    </id>
                    <status>CLOSED</status>
                 </lastValidFlightPlan>
              </summaries>
              <summaries>
                 <lastValidFlightPlan>
                    <id>
                       <id>AA58797228</id>
                       <keys>
                          <aircraftId>OEGMI</aircraftId>
                          <aerodromeOfDeparture>LEMD</aerodromeOfDeparture>
                          <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                          <airFiled>false</airFiled>
                          <aerodromeOfDestination>LFSB</aerodromeOfDestination>
                          <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                          <estimatedOffBlockTime>2016-11-23 13:04</estimatedOffBlockTime>
                       </keys>
                    </id>
                    <status>AIRBORNE</status>
                 </lastValidFlightPlan>
              </summaries>
              <summaries>
                 <lastValidFlightPlan>
                    <id>
                       <id>AA58780893</id>
                       <keys>
                          <aircraftId>OEGMI</aircraftId>
                          <aerodromeOfDeparture>DAUA</aerodromeOfDeparture>
                          <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                          <airFiled>false</airFiled>
                          <aerodromeOfDestination>LEMD</aerodromeOfDestination>
                          <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                          <estimatedOffBlockTime>2016-11-23 09:00</estimatedOffBlockTime>
                       </keys>
                    </id>
                    <status>BACKUP</status>
                 </lastValidFlightPlan>
              </summaries>
              <summaries>
                 <lastValidFlightPlan>
                    <id>
                       <id>AA58783135</id>
                       <keys>
                          <aircraftId>OEGMI</aircraftId>
                          <aerodromeOfDeparture>LEMD</aerodromeOfDeparture>
                          <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                          <airFiled>false</airFiled>
                          <aerodromeOfDestination>LFSB</aerodromeOfDestination>
                          <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                          <estimatedOffBlockTime>2016-11-23 11:55</estimatedOffBlockTime>
                       </keys>
                    </id>
                    <status>BACKUP</status>
                 </lastValidFlightPlan>
              </summaries>
           </data>
        </flight:FlightPlanListReply>
     </S:Body>
  </S:Envelope>
  `;

    test('should parse correct response', () => {
      return parseResponse(exampleResponse).then(
        parsedResponse => expect(parsedResponse).toMatchSnapshot(),
        () => expect(false).toBe(true),
      );
    });

    test('should parse empty response', () => {
      return parseResponse(emptyResponse).then(
        parsedResponse => expect(parsedResponse).toMatchSnapshot(),
        () => expect(false).toBe(true),
      );
    });

    test('should handle multiple response', () => {
      return parseResponse(multipleReponse).then(
        parsedResponse => expect(parsedResponse).toMatchSnapshot(),
        () => expect(false).toBe(true),
      );
    });
  });
});
