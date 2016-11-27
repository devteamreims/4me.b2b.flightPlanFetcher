import _ from 'lodash';
import R from 'ramda';

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
export function airspaceSoapEnvelope(content) {
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

/**
 * Transform a B2B delay string into a Number (unit: minutes)
 * @param  {string} str B2B formatted delay
 * @return {Number}     Delay in minutes
 */
export const parseDelay = str => {
  if(!str) {
    return 0;
  }
  const hours = parseInt(str.substr(0, 2), 10) || 0;
  const minutes = (parseInt(str.substr(2), 10) || 0) + hours * 60;
  return minutes;
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


import {
  parseString as parseXMLStringWithCallback
} from 'xml2js';

/**
 * Transform raw XML data in JS objects
 * @param  {string} input Raw XML data
 * @return {Promise<object>}
 */
export function parseXML(input) {
  const callback = (resolve, reject) => (err, stdout, stderr) => {
    if(err) {
      return reject(new Error('Unable to parse XML data'));
    }
    return resolve(stdout);
  };

  return new Promise((resolve, reject) => parseXMLStringWithCallback(input, {explicitArray: false}, callback(resolve, reject)));
}

/**
 * Remove soap envelope from a parsed XML Object
 * @param {object} Parsed XML object
 * @return {object}
 */
export const unfoldSoapEnvelope = R.pathOr({}, ['S:Envelope', 'S:Body']);

/**
 * B2BError which extends Error and add a `b2bResponse` field
 */
export class B2BError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'B2BError';
    this.b2bResponse = R.propOr(null, 'b2bResponse', options);
  }
}

/**
 * B2BError which extends Error and add a `b2bResponse` field
 */
export class B2BErrorNotFound extends Error {
  constructor(options = {}) {
    const message = 'Object not found';
    super(message);
    this.name = 'B2BErrorNotFound';
    this.b2bResponse = R.propOr(null, 'b2bResponse', options);
  }
}
