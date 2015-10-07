import {init, getAdInfo, exit} from 'ad-info';
import top500 from './top500';
var path = require('path');
let fs = require('fs');
let perSiteInfo = {};
let badFingerprints = new Set();

function writeBadFingerprints() {
  fs.writeFile('./badFingerprints.json', JSON.stringify(badFingerprints), 'utf-8');
}
let sequence = init('./node_modules/ad-info/data/easylist.txt');

top500.forEach(siteHost => {
  sequence = sequence.then(() => {
    console.log('doing lookup for site: ', siteHost);
    return new Promise((resolve, reject) => {
      getAdInfo(`http://${siteHost}`).then(resolve).catch((err) => {
        console.warn('Error obtaining info for site host:', siteHost, '. Error:', err);
        resolve();
      });
    });
  });
  sequence = sequence.then(info  => {
    console.log('site results: ', siteHost, info);
    if (info.badFingerprints) {
      info.badFingerprints.forEach((o) => badFingerprints.add(o.badFingerprint));
      writeBadFingerprints();
    }
    perSiteInfo[siteHost] = info;
  });
});
sequence.then(() => {
  fs.writeFileSync('./perSiteInfo.json', JSON.stringify(perSiteInfo));
}).then(exit).catch(err => console.error('something went wrong:', err));
