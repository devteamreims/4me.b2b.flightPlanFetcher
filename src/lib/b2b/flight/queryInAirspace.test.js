import { query, parseResponse } from './queryInAirspace';
import MockDate from 'mockdate';
describe('queryInAirspace', () => {
  describe('query builder', () => {
    // Our query build depends on the current time
    // MockDate allows snapshot testing by overriding global Date class
    beforeEach(() => {
      MockDate.set(1479898355004);
    });

    afterEach(() => {
      MockDate.reset();
    });

    test('should have proper defaults', () => {
      expect(query()).toMatchSnapshot();
    });

    test('should accept valid arguments', () => {
      expect(() => query()).not.toThrow();
      expect(() => query('string')).not.toThrow();
      expect(() => query('string', {})).not.toThrow();
    });

    test('should reject invalid arguments', () => {
      expect(() => query({})).toThrowErrorMatchingSnapshot();
      expect(() => query(null)).toThrowErrorMatchingSnapshot();
      expect(() => query('string', 'string')).toThrowErrorMatchingSnapshot();
    });

    test('should accept an airspace as argument', () => {
      expect(query('MOCKAIRSPACE')).toMatch(/MOCKAIRSPACE/);
    });

    test('should match snapshot', () => {
      expect(query('MOCKAIRSPACE')).toMatchSnapshot();
    });
  });

  describe('response parser', () => {
    const exampleResponse = `
  <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
    <S:Body>
      <flight:FlightListByAirspaceReply xmlns:flight="eurocontrol/cfmu/b2b/FlightServices" xmlns:common="eurocontrol/cfmu/b2b/CommonServices" xmlns:airspace="eurocontrol/cfmu/b2b/AirspaceServices" xmlns:flow="eurocontrol/cfmu/b2b/FlowServices">
        <requestReceptionTime>2016-11-23 11:11:03</requestReceptionTime>
        <requestId>B2B_CUR:1884063</requestId>
        <sendTime>2016-11-23 11:11:03</sendTime>
        <status>OK</status>
        <data>
          <flights>
             <flight>
                <flightId>
                   <id>AA58786362</id>
                   <keys>
                      <aircraftId>EZY18AG</aircraftId>
                      <aerodromeOfDeparture>LSZH</aerodromeOfDeparture>
                      <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                      <airFiled>false</airFiled>
                      <aerodromeOfDestination>EGGW</aerodromeOfDestination>
                      <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                      <estimatedOffBlockTime>2016-11-23 09:35</estimatedOffBlockTime>
                   </keys>
                </flightId>
             </flight>
          </flights>
          <flights>
             <flight>
                <flightId>
                   <id>AA58788176</id>
                   <keys>
                      <aircraftId>BAW753</aircraftId>
                      <aerodromeOfDeparture>LFSB</aerodromeOfDeparture>
                      <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                      <airFiled>false</airFiled>
                      <aerodromeOfDestination>EGLL</aerodromeOfDestination>
                      <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                      <estimatedOffBlockTime>2016-11-23 10:10</estimatedOffBlockTime>
                   </keys>
                </flightId>
             </flight>
          </flights>
          <flights>
             <flight>
                <flightId>
                   <id>AA58793473</id>
                   <keys>
                      <aircraftId>UAL135</aircraftId>
                      <aerodromeOfDeparture>LSZH</aerodromeOfDeparture>
                      <nonICAOAerodromeOfDeparture>false</nonICAOAerodromeOfDeparture>
                      <airFiled>false</airFiled>
                      <aerodromeOfDestination>KEWR</aerodromeOfDestination>
                      <nonICAOAerodromeOfDestination>false</nonICAOAerodromeOfDestination>
                      <estimatedOffBlockTime>2016-11-23 09:50</estimatedOffBlockTime>
                   </keys>
                </flightId>
             </flight>
          </flights>
          <effectiveTrafficWindow>
            <wef>2016-11-23 10:42</wef>
            <unt>2016-11-23 11:22</unt>
          </effectiveTrafficWindow>
        </data>
      </flight:FlightListByAirspaceReply>
    </S:Body>
  </S:Envelope>
    `;

    const failedResponse = `
    <S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
       <S:Body>
          <flight:FlightListByAirspaceReply xmlns:flight="eurocontrol/cfmu/b2b/FlightServices" xmlns:common="eurocontrol/cfmu/b2b/CommonServices" xmlns:airspace="eurocontrol/cfmu/b2b/AirspaceServices" xmlns:flow="eurocontrol/cfmu/b2b/FlowServices">
             <requestReceptionTime>2016-11-23 11:57:11</requestReceptionTime>
             <requestId>B2B_CUR:1943185</requestId>
             <sendTime>2016-11-23 11:57:11</sendTime>
             <status>INVALID_INPUT</status>
             <inputValidationErrors>
                <attributes>
                   <item>countsInterval:step</item>
                </attributes>
                <group>FLIGHT</group>
                <category>GEN</category>
                <type>INVALID_ATTRIBUTE_VALUE</type>
                <parameters>
                   <item>
                      <key>RECEIVED</key>
                      <value>aze</value>
                   </item>
                   <item>
                      <key>CONSTRAINT</key>
                      <value>value does not respect the expected format: ' four digits 0 to 9'</value>
                   </item>
                </parameters>
             </inputValidationErrors>
          </flight:FlightListByAirspaceReply>
       </S:Body>
    </S:Envelope>
    `;

    test('should parse correct response', () => {
      return parseResponse(exampleResponse).then(
        parsedResponse => expect(parsedResponse).toMatchSnapshot(),
        () => expect(false).toBe(true),
      );
    });

    test('should handle failed response', () => {
      return parseResponse(failedResponse).then(
        () => expect(false).toBe(true),
        error => {
          expect(error.name).toBe('B2BError');
        }
      );
    });

  });
});
