import {findAirspace} from '../../src/actions/profiles/profileParser';

const mockAirspaceProfile = [
  {
    name: "EBBRTMA",
    center: "EBBR",
    enter: "2016-09-30T10:48:30.000Z",
    exit: "2016-09-30T10:50:30.000Z"
  },
  {
    name: "EBBUCTA",
    center: "EBBU",
    enter: "2016-09-30T10:50:30.000Z",
    exit: "2016-09-30T10:56:51.000Z"
  },
  {
    name: "LFFFCTA",
    center: "LFFF",
    enter: "2016-09-30T10:56:51.000Z",
    exit: "2016-09-30T11:20:50.000Z"
  },
  {
    name: "LFEECTA",
    center: "LFEE",
    enter: "2016-09-30T10:58:39.000Z",
    exit: "2016-09-30T11:11:55.000Z"
  },
  {
    name: "LFBBCTA",
    center: "LFBB",
    enter: "2016-09-30T11:20:50.000Z",
    exit: "2016-09-30T12:14:00.000Z"
  },
  {
    name: "LECMCTA",
    center: "LECM",
    enter: "2016-09-30T12:14:00.000Z",
    exit: "2016-09-30T12:50:32.000Z"
  },
  {
    name: "LECSCTA",
    center: "LECS",
    enter: "2016-09-30T12:50:32.000Z",
    exit: "2016-09-30T13:19:00.000Z"
  },
  {
    name: "GMMMCTA",
    center: "GMMM",
    enter: "2016-09-30T13:19:00.000Z",
    exit: "2016-09-30T13:53:13.000Z"
  }
];

const lfeePoint = {
  timeOver: "2016-09-30T11:02:18.000Z",
  flightLevel: "270",
  name: "LESDO",
};

test('should return the closest matching airspace', () => {
  const airspace = findAirspace(mockAirspaceProfile, lfeePoint);
  expect(airspace.center).toBe('LFEE');
});
