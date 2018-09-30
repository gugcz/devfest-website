// Max height and width of the thumbnail in pixels.
import * as functions from 'firebase-functions';

const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const mkdirp = require('mkdirp-promise');
const fs = require('fs');

const THUMB_MAX_HEIGHT = 50;
const THUMB_MAX_WIDTH = 50;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = 'thumb_';

export const pressGraphicsThumb = functions.storage.object().onFinalize((object) => {
  const filePath = object.name;
  const contentType = object.contentType;
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);
  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }
  if (!filePath.startsWith('mediaGraphics/')) {
    console.log('This is not an mediaGraphics image.');
    return null;
  }
  if (fileName.startsWith(THUMB_PREFIX)) {
    console.log('Already a Thumbnail.');
    return null;
  }
  const bucket = gcs.bucket(object.bucket);
  const file = bucket.file(filePath);
  const thumbFile = bucket.file(thumbFilePath);
  const metadata = {
    contentType: contentType,
  };
  return mkdirp(tempLocalDir).then(() => {
    return file.download({ destination: tempLocalFile });
  }).then(() => {
    return spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], { capture: ['stdout', 'stderr'] });
  }).then(() => {
    return bucket.upload(tempLocalThumbFile, { destination: thumbFilePath, metadata: metadata });
  }).then(() => {
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbFile);
    const config = {
      action: 'read',
      expires: '03-01-2500',
    };
    return thumbFile.getSignedUrl(config);
  })
});
