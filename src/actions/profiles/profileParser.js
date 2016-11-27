import R from 'ramda';
import moment from 'moment';

import _ from 'lodash';

const isFlightPlanPoint = R.propEq('flightPlanPoint', 'true');

export function cleanPointProfile(pointProfile) {
  return R.pipe(
    R.filter(isFlightPlanPoint),
    R.map(parsePoint),
  )(pointProfile);
}

function parsePoint(point) {
  const timeOver = R.pipe(
    R.propOr(null, 'timeOver'),
    str => moment.utc(str),
  )(point);

  const flightLevel = R.pathOr(0, ['flightLevel', 'level'], point);

  const name = R.either(
    R.path(['point', 'pointId']),
    R.path(['point', 'nonPublishedPoint-DBEPoint', 'dbePointId']),
  )(point);

  const trend = R.propOr('CRUISE', 'exitTrend', point);

  return {
    timeOver,
    flightLevel,
    name,
    trend
  };
}

const byWhitelist = sectorsWhitelist => R.pipe(
  R.prop('airspaceId'),
  R.contains(R.__, sectorsWhitelist),
);

const transformAirspace = (airspaceProfileItem) => {
  const get = (path, defaultValue) => _.get(airspaceProfileItem, path, defaultValue);

  const fullname = get('airspaceId', 'XXXX');
  const [center, name] = R.splitAt(4, fullname);

  return {
    name,
    fullname,
    center,
    enter: moment.utc(get('firstEntryTime')) || null,
    exit: moment.utc(get('lastExitTime')) || null,
  };
};

export function cleanAirspaceProfile(airspaceProfile, sectorsWhitelist) {
  return R.pipe(
    R.filter(byWhitelist(sectorsWhitelist)),
    R.map(transformAirspace),
  )(airspaceProfile);
}

export const findAirspace = (processedAirspaceProfile, pointProfileItem) => {

  // Sometimes, airspaces will cover each others
  // We must first find possible airspace candidates (meaning our point timestamp is included into enter/exit airspace boundaries)

  const candidates = R.filter(airspaceProfileItem => (
    airspaceProfileItem.enter !== null
    && airspaceProfileItem.exit !== null
    && moment.utc(_.get(pointProfileItem, 'timeOver'))
      .isBetween(
        moment.utc(airspaceProfileItem.enter),
        moment.utc(airspaceProfileItem.exit),
        'second',
        '[]'
      )
    )
  )(processedAirspaceProfile);

  // Here we calculate a distance to airspaceProfile enter/exit boundaries
  const distanceToBoundaries = pointProfileItem => airspaceProfileItem => {
    const distanceToEnter = moment.utc(pointProfileItem.timeOver) - moment.utc(airspaceProfileItem.enter);
    const distanceToExit = moment.utc(airspaceProfileItem.exit) - moment.utc(pointProfileItem.timeOver);
    return distanceToExit + distanceToEnter;
  };

  // Sort candidates by distance, return closest match
  return R.pipe(
    R.sort(distanceToBoundaries(pointProfileItem)),
    R.head,
  )(candidates) || {};

};


const mergeAirspace = processedAirspaceProfile => pointProfileItem => {
  const airspace = R.pick(
    ['name', 'center', 'fullname'],
    findAirspace(processedAirspaceProfile, pointProfileItem),
  );

  return {
    airspace,
    ...pointProfileItem,
  };
}

export const mergeAirspacesIntoPointProfile = R.curry((cleanAirspaceProfile, cleanPointProfile) => {
  return R.map(
    mergeAirspace(cleanAirspaceProfile),
  )(cleanPointProfile);
});
