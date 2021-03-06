import { eventChannel, END } from 'redux-saga';
import request from 'request';
import fs from 'fs-extra';
import path from 'path';
import shortid from 'shortid';
import { pathConfig, serialize, newSoundObj, noop } from 'utils/';

const SCAPI = 'http://api.soundcloud.com';
const SCAPI_TRACKS = `${SCAPI}/tracks`;
const SOUNDCLOUD_KEY = '733c506264b8a0b6b05c85d9f1615567';

export default {
  getSoundCloudObj: noop,

  getSoundCloudSearch(q) {
    const params = { q, client_id: SOUNDCLOUD_KEY, filter: 'downloadable' };
    return fetch(`${SCAPI}/tracks${serialize(params)}`).then(res => res.json());
  },

  getSoundCloudURL(soundcloudID) {
    return eventChannel(emit => {
      let fileSize = 0;
      let dataRead = 0;
      let newSound = {};

      const tmpFile = path.join(pathConfig.userSoundDir, shortid.generate());

      fetch(
        `${SCAPI_TRACKS}/${soundcloudID}${serialize({
          client_id: SOUNDCLOUD_KEY
        })}`
      )
        .then(res => res.json())
        .then(res => {
          if (!res.downloadable) {
            emit(
              new Error('Sorry, that SoundCloud track cannot be downloaded.')
            );
          }

          newSound = {
            ...newSoundObj,
            file: path.join(
              pathConfig.userSoundDir,
              `${shortid.generate()}.mp3`
            ),
            source: 'soundcloudStream',
            name: res.title,
            tags: res.tag_list,
            img:
              res.artwork_url ||
              'https://w.soundcloud.com/icon/assets/images/orange_white_128-e278832.png',
            link: res.permalink_url
          };

          request(`${res.download_url}?client_id=${SOUNDCLOUD_KEY}`)
            .on('response', res => {
              fileSize = res.headers['content-length'];
              if (!fileSize) {
                emit(new Error('Error: Could not access file.'));
              } else {
                res
                  .on('data', data => {
                    const progress = (dataRead += data.length) / fileSize;
                    emit({ ...newSound, progress });
                  })
                  .on('error', e => emit(new Error(`Error: ${e.message}`)))
                  .on('end', () => {
                    fs.rename(tmpFile, newSound.file);
                    emit({ ...newSound, progress: 1 });
                    emit(END); // Completed download
                  });
              }
            })
            .pipe(fs.createWriteStream(tmpFile));
        })
        .catch(res => emit(new Error(res)));

      return noop;
    });
  }
};
