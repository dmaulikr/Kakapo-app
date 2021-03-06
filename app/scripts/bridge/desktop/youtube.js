import { eventChannel, END } from 'redux-saga';
import ytdl from 'ytdl-core';
import fs from 'fs-extra';
import path from 'path';
import shortid from 'shortid';
import { pathConfig, newSoundObj, noop } from 'utils/';

const getYoutubeURL = data =>
  eventChannel(emit => {
    let fileSize = 0;
    let dataRead = 0;
    let newSound = {};

    const tmpFile = path.join(pathConfig.userSoundDir, shortid.generate());

    ytdl(`https://www.youtube.com/watch?v=${data.file}`, {
      format: 'audioonly',
      debug: true
    })
      .on('response', ({ headers }) => {
        fileSize = headers['content-length'];
      })
      .on(
        'info',
        (
          { title, keywords, thumbnail_url, video_id: videoID },
          { container }
        ) => {
          newSound = {
            ...newSoundObj,
            file: path.join(
              pathConfig.userSoundDir,
              `${shortid.generate()}.${container}`
            ),
            img: thumbnail_url,
            link: `https://www.youtube.com/watch?v=${videoID}`,
            name: title,
            source: 'youtubeStream',
            tags: keywords ? keywords.join(' ') : ''
          };
        }
      )
      .on('error', e => {
        emit(Error(`Error: ${e.message}`));
      })
      .on('data', data => {
        const progress = (dataRead += data.length) / fileSize;
        emit({ ...newSound, progress });
      })
      .on('finish', () => {
        fs.rename(tmpFile, newSound.file);
        emit({ ...newSound, progress: 1 });
        emit(END); // Completed download
      })
      .pipe(fs.createWriteStream(tmpFile));

    return noop;
  });

export default {
  getYoutubeObj: noop,
  getYoutubeURL
};
