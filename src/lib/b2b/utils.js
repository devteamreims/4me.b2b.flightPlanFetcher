import _ from 'lodash';

/**
 * Wraps the query in a proper SOAP:Envelope
 * @param  {String} content Query to be wrapped
 * @return {String}         Properly wrapped query (flightService)
 */
export function flightSoapEnvelope(content) {
  if(!content || typeof content !== 'string') {
    throw new Error('Invalid argument : please provide a String');
  }

  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:flig="eurocontrol/cfmu/b2b/FlightServices">
      <soapenv:Header/>
      <soapenv:Body>
        ${content}
      </soapenv:Body>
    </soapenv:Envelope>
  `;
}

/**
 * Wraps the query in a proper SOAP:Envelope
 * @param  {String} content Query to be wrapped
 * @return {String}         Properly wrapped query (airspaceService)
 */
export function airspaceServiceSoapEnvelope(content) {
  if(!content || typeof content !== 'string') {
    throw new Error('Invalid argument : please provide a String');
  }

  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:air="eurocontrol/cfmu/b2b/AirspaceServices">
      <soapenv:Header/>
      <soapenv:Body>
        ${content}
      </soapenv:Body>
    </soapenv:Envelope>
  `;
}


export const b2bTimeFormat = 'YYYY-MM-DD HH:mm';
export const b2bDateFormat = 'YYYY-MM-DD';
export const b2bTimeFormatWithSeconds = b2bTimeFormat + ':ss';
/**
 * Format a duration in a B2B compatible format (4 digits)
 * @param  {String} str HHMM format
 * @return {String}
 */
export const b2bFormatDuration = (str) => _.padStart(_.take(`${str}`, 4).join(''), 4, '0');
