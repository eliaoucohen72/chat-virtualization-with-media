import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

import messages from './messages';
import { style } from './style';
import { isAudioFile, isImageFile, isPdfFile, isVideoFile } from '../../../sdk/src/utils/commonFunctions';
import AttachmentDocument from '../../../components/SVGComponents/attachmentDocument';
import { formatBytes } from '../../HomePage/utils';
import { GlobalContext } from '../../App/context';
import { COLOR_MAP, getStaticImages } from '../../App/constants';
import ImageAttachment from '../../../components/SVGComponents/imageAttachment';
import FileAttachment from '../../../components/SVGComponents/fileAttachment';
import { translateMessage } from '../../../i18n';

const useStyles = makeStyles(style);
const CloseSmall = getStaticImages('closeSmall.svg');

const AttachmentBox = props => {
  const { color } = useContext(GlobalContext);
  const classesProps = { organizationProfileColor: color, chatPopoverMode: props.chatPopoverMode };
  const classes = useStyles(classesProps);

  const removeAttachment = (index, files) => props.removeAttachment([...files.slice(0, index), ...files.slice(index + 1)]);

  const blobUrl = blob => {
    if (!blob.url) {
      // eslint-disable-next-line no-param-reassign
      blob.url = URL.createObjectURL(blob);
    }
    return blob.url;
  };

  const renderAttachmentPreview = () =>
    props.messageAttachments.map((message, index) => {
      const src = blobUrl(message);
      const { name, size } = message;
      const isImage = isImageFile(name);
      const isVideo = isVideoFile(name);
      const isAudio = isAudioFile(name);

      return (
        <React.Fragment key={index}>
          <div className={classes.singleAttachmentWrapper}>
            {/* IMAGE OR VIDEO */}
            {isImage || isVideo ? (
              <>
                <div className={classes.flexCenter}>
                  <div className={classes.attachmentPreview}>
                    {isImage ? <img className={classes.fitMedia} src={src} alt={name} /> : <video className={classes.fitMedia} src={src} controls />}
                  </div>
                  <div className={classes.fileDescription}>
                    <div className={classes.fileName}>{name}</div>
                    <div className={classes.fileSize}>{formatBytes(size)}</div>
                  </div>
                </div>
                <img className={classes.removeAttachment} onClick={() => removeAttachment(index, props.messageAttachments)} src={CloseSmall} alt="" />
              </>
            ) : (
              /* OTHER */
              <>
                <div className={classes.flexCenter}>
                  {isAudio ? (
                    <div className={classes.m160}>
                      <audio src={src} controls />
                    </div>
                  ) : (
                    <div className={classes.m1624}>
                      <AttachmentDocument />
                    </div>
                  )}

                  <div className={classes.fileDescription}>
                    <div className={classes.fileName}>{name}</div>
                    <div className={classes.fileSize}>{formatBytes(size)}</div>
                  </div>
                </div>
                <img className={classes.removeAttachment} onClick={() => removeAttachment(index, props.messageAttachments)} src={CloseSmall} alt="" />
              </>
            )}
          </div>
          {index !== props.messageAttachments.length - 1 ? displayMessageSeparator() : null}
        </React.Fragment>
      );
    });

  const removeReplyMessage = () => props.setReplyMessage(null);

  const renderReplyMessage = () => {
    const { attachment, body, nickname } = props.replyMessage;
    const name = props.replyMessage.sender === 'me' ? `${translateMessage({ ...messages.me })}:` : `${nickname}:`;
    const isPdf = isPdfFile(attachment);
    const isImage = isImageFile(attachment);
    const isAudio = isAudioFile(attachment);
    const isVideo = isVideoFile(attachment);
    const isMedia = !!attachment && (isAudio || isVideo || isImage);
    const isOtherFile = !!attachment && !isMedia;
    const realBody = isPdf ? 'PDF' : body.trim() !== '' ? body : isMedia ? translateMessage({ ...messages.media }) : '';

    return (
      <>
        <div className={classes.singleAttachmentWrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px 0', gap: '24px' }}>
            <div style={{ backgroundColor: COLOR_MAP.middleGrey, width: '100%', borderLeft: '4px solid #30505D' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '0 8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#071F35' }}>{name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {isMedia && <ImageAttachment />}
                    {isOtherFile && <FileAttachment />}
                    <div style={{ fontSize: '15px', fontWeight: 400 }}>{realBody}</div>
                  </div>
                </div>
                {isImage && <img style={{ maxWidth: '64px' }} src={attachment} alt="" />}
              </div>
            </div>
            <img className={classes.removeAttachment} onClick={removeReplyMessage} src={CloseSmall} alt="" />
          </div>
        </div>
        {props.messageAttachments.length ? displayMessageSeparator() : null}
      </>
    );
  };

  const displayMessageSeparator = () => <div className={classes.messageSeparator} />;

  return (
    <div
      className={classes.attachmentBoxWrapper}
      ref={el => {
        if (el) {
          props.setAttachmentBoxHeight(el.getBoundingClientRect().height);
        }
      }}>
      {props.replyMessage && renderReplyMessage()}
      {props.messageAttachments && renderAttachmentPreview()}
    </div>
  );
};

AttachmentBox.propTypes = {
  messageAttachments: PropTypes.array,
  setAttachmentBoxHeight: PropTypes.func,
  chatPopoverMode: PropTypes.bool,
  removeAttachment: PropTypes.func,
  replyMessage: PropTypes.object,
  setReplyMessage: PropTypes.func
};

export default AttachmentBox;
