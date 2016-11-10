import R from 'ramda';
import fs from 'fs';

const getWhitelistFromDisk = () => {
  if(process.env.NODE_ENV === 'test') {
    return ['LFEEUR', 'LFEEXR', 'LFEEKR', 'LFEEKD'];
  }

  const rawWhitelist = fs.readFileSync(process.env.ES_WHITELIST_PATH, {encoding: 'utf-8'});
  const whitelist = JSON.parse(rawWhitelist);

  return whitelist;
}

const whitelist = getWhitelistFromDisk();


export function isWhitelisted(sector) {
  return R.contains(sector, whitelist);
}
