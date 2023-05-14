import React, { useState, memo, useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { StaticMap, Marker } from 'react-map-gl';
import { isEqual } from 'lodash';
import { Menu, MenuItem } from '@mui/material';

import Validate from '../../../components/SVGComponents/validate';
import { style } from './style';
import { isImageFile, isVideoFile, isAudioFile, isAacFile } from '../../../sdk/src/utils/commonFunctions';
import { DEFAULT_VIEWPORT } from '../../Map/constants';
import MarkerPointer from '../../../components/SVGComponents/markerPointer';
import CircularProgressBar from '../../../components/CircleProgressBar';
import messages from './messages';
import MediaModal from '../../../components/MediaModal';
import { GlobalContext } from '../../App/context';
import { LANGUAGE_DIRECTIONS } from '../../App/enums';
import { isBot } from '../../HomePage/utils';
import { LANGUAGES } from '../../../sdk/src/utils/enums';
import { getStaticImages } from '../../App/constants';
import { returnMediaInformation, getOnlyFilenameFromServerPath, returnFormattedTime } from '../../../utils/commonFunctions';
import DoubleValidate from '../../../components/SVGComponents/doubleValidate';
import SendingMessage from '../../../components/SVGComponents/sendingMessage';
import { MEDIA_MODAL_TYPES } from '../../../components/MediaModal/enums';
import ThreePoints from '../../../components/SVGComponents/threePoints';
import { translateMessage } from '../../../i18n';
import Forward from '../../../components/SVGComponents/forward';
import { popupModes } from '../../HomePage/enums';
import ReplyAudio from '../../../components/SVGComponents/replyAudio';
import ReplyVideo from '../../../components/SVGComponents/replyVideo';
import ReplyImage from '../../../components/SVGComponents/replyImage';
import AudioBubble from '../AudioBubble';
import { MEDIA_BUBBLE_MAX_HEIGHT } from '../constants';

const useStyles = makeStyles(style);
const Download = getStaticImages('download.svg');

const Bubble = props => {
  const { color, language } = useContext(GlobalContext);
  const [mediaModal, setMediaModal] = useState(null);
  const [menu, setMenu] = useState({ anchorPosition: null });
  const videoRef = useRef(null);

  useEffect(() => {
    async function fixMediaInformation(media) {
      await returnMediaInformation(media);
    }
    if (videoRef.current) {
      fixMediaInformation(videoRef.current);
    }
  }, []);

  const renderBorderRadius = () => {
    const { sender, isFirst } = props.message;

    if (!props.isTheSameSender || isFirst) {
      if (sender === 'them') {
        return '16px 0px 16px 16px';
      }
      return '0px 16px 16px 16px';
    }

    return '16px';
  };

  // const bubbleContentDirection = () => {
  //   if (language === LANGUAGES.HE) {
  //     if (isFirstLetterHebrew(props.message.body && props.message.body[0])) {
  //       return LANGUAGE_DIRECTIONS.LTR;
  //     }
  //     return LANGUAGE_DIRECTIONS.RTL;
  //   }
  //   if (isFirstLetterHebrew(props.message.body && props.message.body[0])) {
  //     return LANGUAGE_DIRECTIONS.RTL;
  //   }
  //   return LANGUAGE_DIRECTIONS.LTR;
  // };

  const src = props.message.attachment;
  const isImage = isImageFile(props.message.attachmentDescription || src);
  const isVideo = isVideoFile(props.message.attachmentDescription || src);
  const isAudio = isAudioFile(props.message.attachmentDescription || src) || isAacFile(props.message.attachmentDescription || src);
  const isAac = isAacFile(props.message.attachmentDescription || src);

  const classesProps = {
    isIncoming: props.message.sender === 'them',
    isFirst: props.message.isFirst,
    // isVideo,
    isAudio,
    // isImage,
    organizationProfileColor: color,
    isTheSameSender: props.isTheSameSender,
    isAttachmentContainsText: props.message.attachment && props.message.body !== 'undefined',
    borderRadius: renderBorderRadius(),
    direction: language === LANGUAGES.HE ? LANGUAGE_DIRECTIONS.RTL : LANGUAGE_DIRECTIONS.LTR,
    chatPopoverMode: props.chatPopoverMode,
    isReplyMessage: !!props.message.repliedToMessageID
    // isGeoLocationMessage: props.message.isGeoLocationMessage
  };

  const classes = useStyles(classesProps);

  /**
   * Open attachment file (other type) in a new tab and if not download it
     If the browser does not success to open the file, it is download it
   */
  const openInTabOrDownload = () => window.open(props.message.attachment, '_blank');
  const closeMediaModal = () => setMediaModal(null);
  const openMenu = e => setMenu({ anchorPosition: { x: e.clientX, y: e.clientY } });
  const closeMenu = () => setMenu({ anchorPosition: null });

  const forward = () => {
    props.setForwardMessage(props.message);
    props.handleDialogOpen(popupModes.forwardMessage);
    closeMenu();
  };

  const reply = () => {
    props.setReplyMessage(props.message);
    closeMenu();
  };

  /**
   * Render attachment by type
   */
  const renderAttachment = () => {
    if (isImage) {
      return (
        <img
          onLoad={() => props.listRef.current.recomputeRowHeights(props.index)}
          onClick={() => setMediaModal(src)}
          className={classes.mediaAttachment}
          style={{ width: props.message.width, height: props.message.height }}
          src={src}
          alt=""
        />
      );
    }

    if (isAudio) {
      return (
        <AudioBubble
          message={props.message}
          src={src}
          isAac={isAac}
          setCurrentPlayingAudio={props.setCurrentPlayingAudio}
          currentPlayingAudio={props.currentPlayingAudio}
          chatPopoverMode={props.chatPopoverMode}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          onLoadedMetadata={() => props.listRef.current.recomputeRowHeights(props.index)}
          ref={videoRef}
          className={classes.mediaAttachment}
          src={src}
          controls
        />
      );
    }

    return (
      <div className={classes.otherAttachment}>
        <div className={classes.mr10}>{getOnlyFilenameFromServerPath(src)}</div>
        <img className={classes.pointer} src={Download} onClick={openInTabOrDownload} alt="" />
      </div>
    );
  };

  /**
   * In case of file attachment, it is display a circle progress bar during the file loading
   */
  const renderProgressBar = () => <CircularProgressBar value={Math.ceil(props.message.progress * 100)} width={60} />;

  /**
   * In case of geolocation attachment, it is display a static map when I attached coordinates
   */
  const renderGeoAttachment = () => {
    const { glLat, glLon } = props.message;
    return (
      <StaticMap
        mapboxApiAccessToken={window.wideBridgeConfig.mapBox.token}
        width="100%"
        height={`${MEDIA_BUBBLE_MAX_HEIGHT}px`}
        latitude={glLat}
        longitude={glLon}
        zoom={DEFAULT_VIEWPORT.zoom}>
        <Marker latitude={glLat} longitude={glLon} zoom={DEFAULT_VIEWPORT.zoom}>
          <MarkerPointer />
        </Marker>
      </StaticMap>
    );
  };

  const returnMessage = () => {
    const { glLat, glLon, isGeoLocationMessage, body } = props.message;

    return isGeoLocationMessage && props.mapCapability ? (
      <div className={classes.geoLocMessage} onClick={() => props.flyToSpecificAddress(glLat, glLon)}>
        {body}
      </div>
    ) : props.searchInput !== '' && body.toLowerCase().indexOf(props.searchInput.toLocaleLowerCase()) !== -1 ? (
      renderedBody(body)
    ) : body.trim() !== '' ? (
      <div style={{ maxWidth: props.message.width || undefined }}>{body}</div>
    ) : null;
  };

  const renderedBody = body => {
    const searchIndex = body.toLowerCase().indexOf(props.searchInput.toLocaleLowerCase());
    const beforeSearchTerm = body.substring(0, searchIndex);
    const searchTerm = body.substring(searchIndex, searchIndex + props.searchInput.length);
    const afterSearchTerm = body.substring(searchIndex + props.searchInput.length);

    return (
      <div className={classes.inline}>
        <span className={classes.greyBlack}>{beforeSearchTerm}</span>
        <span className={classes.searchedTerm}>{searchTerm}</span>
        <span className={classes.greyBlack}>{afterSearchTerm}</span>
      </div>
    );
  };

  const renderSenderNickname = () =>
    props.isGroupMessage &&
    props.message.sender === 'them' &&
    (props.message.isFirst || !props.isTheSameSender) && <div className={classes.name}>{props.message.nickname}</div>;

  const returnStatusMessageIcon = () => {
    if (props.message.sender === 'me') {
      if (props.message.wasReceived && props.message.wasDisplayed) {
        return <DoubleValidate displayed />;
      }

      if (props.message.wasReceived && !props.message.wasDisplayed) {
        return <DoubleValidate />;
      }

      if (!props.message.wasReceived && !props.message.wasDisplayed) {
        return <Validate />;
      }

      if (props.message.id === 'tempId') {
        return <SendingMessage />;
      }
    }
    return null;
  };

  const renderMenu = () => (
    <Menu
      open
      anchorReference="anchorPosition"
      anchorPosition={{ top: menu.anchorPosition.y, left: menu.anchorPosition.x }}
      keepMounted
      onClose={closeMenu}
      classes={{ paper: classes.paper }}
      MenuListProps={{ disablePadding: true }}>
      <MenuItem disabled={props.disableForward} classes={{ root: classes.root }} onClick={forward}>
        <Forward />
        {translateMessage({ ...messages.forward })}
      </MenuItem>
      {!isBot(props.contact.nickname) && (
        <MenuItem classes={{ root: classes.root }} onClick={reply}>
          <Forward mirrored />
          {translateMessage({ ...messages.reply })}
        </MenuItem>
      )}
    </Menu>
  );

  // eslint-disable-next-line no-unused-vars
  const jumpToMessage = () => props.jumpToMessage(props.message.repliedToMessageID);

  const renderReplyMessagePart = () => {
    const message = props.contact.chatBox.getSingleMessage(props.message.repliedToMessageID);
    if (message) {
      const sender = message.sender === 'them' ? message.displayName || message.nickname : translateMessage({ ...messages.me });

      return (
        <div
          // onClick={jumpToMessage}
          style={{
            backgroundColor: '#bdbdbd',
            borderRadius: '10px',
            padding: '5px 8px 5px 5px',
            // cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}>
          <div style={{ fontSize: '13px', fontWeight: 400 }}>{sender}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {(isAudioFile(message.attachmentDescription || message.attachment) ||
                  isAacFile(message.attachmentDescription || message.attachment)) && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <ReplyAudio />
                    <div style={{ fontSize: '13px', fontWeight: 400 }}>{translateMessage({ ...messages.audio })}</div>
                  </div>
                )}
                {isVideoFile(message.attachmentDescription || message.attachment) && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <ReplyVideo />
                    <div style={{ fontSize: '13px', fontWeight: 400 }}>{translateMessage({ ...messages.video })}</div>
                  </div>
                )}
                {isImageFile(message.attachmentDescription || message.attachment) && (
                  <div>
                    <ReplyImage />
                  </div>
                )}
                {message.body && <div style={{ fontSize: '13px' }}>{message.body}</div>}
              </div>
              {isImageFile(message.attachmentDescription || message.attachment) && (
                <img
                  style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'contain', pointerEvents: 'none' }}
                  src={message.attachment}
                  alt=""
                />
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderForwardedMessageHeader = () => (
    <div style={{ display: 'flex', gap: '4px', fontSize: '13px', fontStyle: 'italic', alignItems: 'center' }}>
      <Forward />
      {translateMessage({ ...messages.forwarded })}
    </div>
  );

  return (
    <>
      <div className={classes.wrapper}>
        {props.isHovered && (
          <div className={classes.threePoints} onClick={openMenu}>
            <ThreePoints />
          </div>
        )}
        {renderSenderNickname()}
        {props.message.repliedToMessageID && renderReplyMessagePart()}
        {props.message.isForwardedMessage && renderForwardedMessageHeader()}
        {props.message.body && props.message.body !== 'undefined' ? returnMessage() : null}
        {props.message.isGeoLocationMessage && renderGeoAttachment()}
        {!props.message.isSplashMessage &&
          !props.message.isGeoLocationMessage &&
          (props.message.isSendingFile && props.message.progress < 1 ? renderProgressBar() : props.message.attachment ? renderAttachment() : null)}
        <div className={classes.fs40BcRed}>{props.message.isGeoLocationMessage && props.mapCapability}</div>
        <div className={classes.timeWrapper}>
          <div className={classes.time}>{returnFormattedTime(props.message.sendingDate)}</div>
          {returnStatusMessageIcon()}
        </div>
        {mediaModal && <MediaModal open={mediaModal} close={closeMediaModal} type={MEDIA_MODAL_TYPES.IMAGE} />}
      </div>
      {menu.anchorPosition && renderMenu()}
    </>
  );
};
Bubble.propTypes = {
  message: PropTypes.object,
  isTheSameSender: PropTypes.bool,
  isGroupMessage: PropTypes.bool,
  flyToSpecificAddress: PropTypes.func,
  mapCapability: PropTypes.bool,
  searchInput: PropTypes.string,
  chatPopoverMode: PropTypes.bool,
  isHovered: PropTypes.bool,
  handleDialogOpen: PropTypes.func,
  setForwardMessage: PropTypes.func,
  setReplyMessage: PropTypes.func,
  contact: PropTypes.object,
  jumpToMessage: PropTypes.func,
  currentPlayingAudio: PropTypes.object,
  setCurrentPlayingAudio: PropTypes.func,
  disableForward: PropTypes.bool,
  listRef: PropTypes.object,
  index: PropTypes.number
};

export default memo(
  Bubble,
  (prevProps, props) =>
    props.message.id === prevProps.message.id &&
    props.message.receivedDate === prevProps.message.receivedDate &&
    props.message.progress === prevProps.message.progress &&
    props.message.wasDisplayed === prevProps.wasDisplayed &&
    props.message.wasReceived === prevProps.wasReceived &&
    props.searchInput === prevProps.searchInput &&
    props.isHovered === prevProps.isHovered &&
    props.nextAudioMessageId === prevProps.nextAudioMessageId &&
    isEqual(props.groupMembers, prevProps.groupMembers)
);
