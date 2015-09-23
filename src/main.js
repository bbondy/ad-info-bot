import {init, getAdInfo, exit} from 'ad-info';
import top500 from './top500';

var sequence = init();
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
  });
});
sequence.then(exit).catch(err => console.error('something went wrong:', err));
