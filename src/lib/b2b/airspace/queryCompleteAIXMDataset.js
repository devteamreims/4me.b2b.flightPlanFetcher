import moment from 'moment';
import invariant from 'invariant';
import R from 'ramda';

import {
  b2bTimeFormatWithSeconds,
  b2bTimeFormat,
  b2bDateFormat,
  airspaceSoapEnvelope,
  parseXML,
  unfoldSoapEnvelope,
} from '../utils';


export function query() {
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

  return airspaceSoapEnvelope(query);
}

export function parseResponse(rawResponse) {
  return R.pipeP(
    // Transform raw XML to JS
    parseXML,
    // Remove SOAP Envelope
    unfoldSoapEnvelope,
  )(rawResponse);
}
