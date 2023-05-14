/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/media-has-caption */

import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { Dialog } from '@mui/material';
import Webcam from 'react-webcam';

import AttachmentPopup from '../AttachmentPopup';
import { style } from './style';
import './cssStyle.css';
import messages from './messages';
import { translateMessage } from '../../../i18n';
import SendMessage from '../../../components/SVGComponents/sendMessage';
import Trombone from '../../../components/SVGComponents/trombone';
import { CHAT_INPUT_MAX_CHARACTER, MAX_VIDEO_RECORDING_TIME } from '../constants';
import { GlobalContext } from '../../App/context';
import ToolTip from '../../../components/ToolTip';
import { COLOR_MAP, getStaticImages } from '../../App/constants';
import Timer from '../../../components/Timer';
import RecordingDot from '../../../components/SVGComponents/recordingDot';
import CaptureVideo from '../../../components/SVGComponents/captureVideo';
import CapturePhoto from '../../../components/SVGComponents/capturePhoto';
import StopCaptureVideo from '../../../components/SVGComponents/stopCaptureVideo';
import Trash from '../../../components/SVGComponents/trash';
import { MediaErrorType } from '../../../sdk/src/hardware/ioManager';
import Loading from '../../../components/SVGComponents/loading';
import { WEBCAM_MODE } from './constants';
import SimpleDialog from '../../../components/CommonComponents/SimpleDialog';
import { useRefState } from '../../../utils/customHooks';
// import MediaControls from '../../../components/MediaControls';

const useStyles = makeStyles(style);

const Close = getStaticImages('closeBig.svg');
const NoCamera = getStaticImages('noCamera.svg');

const TogglePhotoVideoButton = ({ capturedImage, videoChunks, toggleCameraDialog, cameraDialogDisplay, videoCapturing }) =>
  !capturedImage &&
  !videoCapturing &&
  videoChunks.length === 0 && (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '36px',
          width: '185px',
          backgroundColor: '#E8E8E8',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        onClick={toggleCameraDialog}>
        {cameraDialogDisplay === WEBCAM_MODE.PHOTO
          ? translateMessage({ ...messages.switchToVideo })
          : translateMessage({ ...messages.switchToPhoto })}
      </div>
    </div>
  );

TogglePhotoVideoButton.propTypes = {
  capturedImage: PropTypes.string,
  videoChunks: PropTypes.array,
  cameraDialogDisplay: PropTypes.string,
  videoCapturing: PropTypes.bool,
  toggleCameraDialog: PropTypes.func
};

const MessageBar = props => {
  const { color, font } = useContext(GlobalContext);
  const [attachmentPopupPosition, setAttachmentPopupPosition] = useState({ x: 0, y: 0 });

  // AUDIO
  const audioMediaRecorderRef = useRef(null);
  const [audioTimeStamp, setAudioTimeStamp] = useState(0);
  const [audioCapturing, audioCapturingRef, setAudioCapturing] = useRefState(false);
  const [audioChunks, setAudioChunks] = useState([]);

  // VIDEO
  const webcamRef = useRef(null);
  const videoPlayer = useRef(null);
  const videoMediaRecorderRef = useRef(null);
  const [videoTimeStamp, videoTimeStampRef, setVideoTimeStamp] = useRefState(0);
  const [cameraDialogDisplay, setCameraDialogDisplay] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [videoCapturing, setVideoCapturing] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);
  const [videoCaptureReached, setVideoCaptureReached] = useState(false);
  const [localVideoError, setLocalVideoError] = useState(false);
  const [streamVideoLoaded, setStreamVideoLoaded] = useState(false);
  const [stopConfirmationDialogDisplay, setStopConfirmationDialogDisplay] = useState(false);

  const checkIfNoAttachmentOrMessage = () => !audioCapturing && !props.messageAttachments.length && props.chatTextAreaValue.trim() === '';

  const classesProps = {
    messageCounter: props.messageAttachments.length,
    noAttachmentAndNoMessage: checkIfNoAttachmentOrMessage(),
    organizationProfileColor: color,
    offline: props.offline,
    font,
    audioCapturing
  };
  const classes = useStyles(classesProps);

  useEffect(() => {
    if (audioCapturing) {
      setAudioTimeStamp(Date.now() / 1000);
    }
  }, [audioCapturing]);

  useEffect(() => {
    if (videoCapturing) {
      setVideoTimeStamp(Date.now() / 1000);
    }
  }, [setVideoTimeStamp, videoCapturing]);

  const captureImage = useCallback(() => {
    setCapturedImage(webcamRef.current.getScreenshot());
  }, [webcamRef]);

  const resetVideoTracks = () => {
    if (videoMediaRecorderRef.current) {
      videoMediaRecorderRef.current.stream.getTracks().forEach(e => e.stop());
      videoMediaRecorderRef.current = null;
    }
  };

  const resetVideoData = () => {
    setVideoTimeStamp(0);
    setVideoCapturing(false);
    setVideoChunks([]);
    setCapturedImage(null);
    setVideoCaptureReached(false);
    setStreamVideoLoaded(false);
  };

  const closeCameraDialog = () => setCameraDialogDisplay(null);

  const resetAudioData = () => {
    setAudioCapturing(0);
    setAudioChunks([]);
    setAudioCapturing(false);
    audioMediaRecorderRef.current.stream.getTracks().forEach(e => e.stop());
    audioMediaRecorderRef.current = null;
  };

  const saveCapturedMedia = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'image.jpg');
          props.handleSetMessageAttachments([file]);
          props.setAttachmentBox(true);
        });
    } else if (videoChunks.length > 0) {
      const blob = new Blob(videoChunks);
      const file = new File([blob], 'video.mkv');
      props.handleSetMessageAttachments([file]);
      props.setAttachmentBox(true);
    }
    resetVideoData();
    resetVideoTracks();
    closeCameraDialog();
  };

  /**
   * Click event
   *
   * @param  {object} event
   */

  const handleClick = event => {
    props.setAttachmentPopupDisplay(event.currentTarget);
    setAttachmentPopupPosition({ x: event.clientX, y: event.clientY });
  };

  const returnTrimmedAndLimitedInput = value => {
    const trimmedValue = value.trimStart();
    const savedValue = trimmedValue.length < CHAT_INPUT_MAX_CHARACTER ? trimmedValue : trimmedValue.substring(0, CHAT_INPUT_MAX_CHARACTER);
    return savedValue;
  };

  /**
   * Send a message when the user type on enter
   */
  const sendMessage = () => {
    if (audioChunks.length) {
      // handleDownloadAudio();
      stopAudioCapture();
      const blob = new Blob(audioChunks);
      const file = new File([blob], 'audio.webm');
      resetAudioData();
      props.sendMessage(props.chatTextAreaValue, props.messageAttachments.concat(file));
    } else if (props.messageAttachments.length) {
      props.sendMessage(props.chatTextAreaValue, props.messageAttachments);
    } else {
      props.sendMessage(props.chatTextAreaValue);
    }
    props.removeAllAttachments();
    props.setChatTextAreaValue('');
  };

  /**
   * Handle user typing
   *
   * @param  {object} e
   */
  const onInputChange = e => {
    props.setChatTyping();
    const input = returnTrimmedAndLimitedInput(e.target.value);
    props.setChatTextAreaValue(input);
  };

  const onKeyDown = e => {
    if (e.keyCode === 13) {
      if (!props.chatTextAreaValue.length) {
        e.preventDefault();
        return;
      }

      sendMessage();
      props.setChatTextAreaValue('');
    }
  };

  /**
   * Load locally the files that the user choose to upload
   *
   * @param  {object} files - Files list
   */
  const uploadFile = files => {
    props.handleSetMessageAttachments(files);
    props.setAttachmentBox(true);
  };

  /**
   * Handle drag enter event for the input div
   *
   * @param  {object} e - Event
   */
  const onDragEnter = e => {
    if (e.target.matches('textarea#dragAndDropDiv')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Handle drag leave event for the input div
   *
   * @param  {object} e - Event
   */
  const onDragLeave = e => {
    if (e.target.matches('textarea#dragAndDropDiv')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Handle drag over event for the input div
   *
   * @param  {object} e - Event
   */
  const onDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle drop event for the input div, and remember the future uploaded files
   *
   * @param  {object} e - Event
   */
  const onDrop = e => {
    if (e.target.matches('textarea#dragAndDropDiv')) {
      e.preventDefault();
      e.stopPropagation();
      props.handleSetMessageAttachments([...e.dataTransfer.files]);
      props.setAttachmentBox(true);
    }
  };

  const returnInputWrapper = () => (
    <div className={classes.inputWrapper}>
      <div className={classes.message}>
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          dir="auto"
          id="dragAndDropDiv"
          className={classes.textArea}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          maxLength={CHAT_INPUT_MAX_CHARACTER}
          value={props.chatTextAreaValue}
          placeholder={translateMessage({ ...messages.writeMessageOrDropFileHere })}
        />
      </div>
      <ToolTip title={translateMessage({ ...messages.attachments })}>
        <div className={classes.attachmentWrapper} onClick={handleClick}>
          <Trombone isEnabled={props.messageAttachments.length > 0} />
        </div>
      </ToolTip>
    </div>
  );

  const handleAudioDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0 && audioCapturingRef.current) {
        setAudioChunks(prev => prev.concat(data));
      }
    },
    [audioCapturingRef]
  );

  const handleVideoDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0 && videoTimeStampRef.current > 0) {
        setVideoChunks(prev => prev.concat(data));
      }
    },
    [videoTimeStampRef]
  );

  const startAudioCapture = useCallback(() => {
    setAudioCapturing(true);
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: props.localStorageDevices.input ? { exact: props.localStorageDevices.input } : undefined },
        video: false
      })
      .then(stream => {
        audioMediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        audioMediaRecorderRef.current.addEventListener('dataavailable', handleAudioDataAvailable);
        audioMediaRecorderRef.current.start(100);
      })
      .catch(err => console.error('handleStartAudioCaptureClick ', err));
  }, [handleAudioDataAvailable, props.localStorageDevices.input, setAudioCapturing]);

  const startVideoCapture = useCallback(() => {
    setVideoCapturing(true);
    videoMediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, { mimeType: 'video/x-matroska;codecs=h264' });
    videoMediaRecorderRef.current.addEventListener('dataavailable', handleVideoDataAvailable);
    videoMediaRecorderRef.current.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef, setVideoCapturing, videoMediaRecorderRef]);

  const stopVideoCapture = useCallback(() => {
    videoMediaRecorderRef.current.stop();
    setVideoCapturing(false);
  }, [videoMediaRecorderRef, setVideoCapturing]);

  const stopAudioCapture = useCallback(() => {
    audioMediaRecorderRef.current.stop();
  }, [audioMediaRecorderRef]);

  const getVideoPreviewUrl = useCallback(() => {
    if (videoChunks.length) {
      const blob = new Blob(videoChunks);
      return URL.createObjectURL(blob);
    }
    return null;
  }, [videoChunks]);

  // const handleDownloadVideo = useCallback(() => {
  //   if (videoChunks.length) {
  //     const blob = new Blob(videoChunks);
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     document.body.appendChild(a);
  //     a.style = 'display: none';
  //     a.href = url;
  //     a.download = 'video.mkv';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   }
  // }, [videoChunks]);

  // const handleDownloadAudio = useCallback(() => {
  //   if (audioChunks.length) {
  //     const blob = new Blob(audioChunks);
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     document.body.appendChild(a);
  //     a.style = 'display: none';
  //     a.href = url;
  //     a.download = 'audio.webm';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   }
  // }, [audioChunks]);

  const closeSetAttachmentPopup = () => props.setAttachmentPopupDisplay(null);

  const closeDialog = () => {
    resetVideoData();
    resetVideoTracks();
    closeCameraDialog();
  };

  const deleteAudioRecording = () => {
    stopAudioCapture();
    resetAudioData();
  };

  const handleMaximumVideoCaptureReached = () => {
    stopVideoCapture();
    setVideoCaptureReached(true);
  };

  const returnAudioRecordingWrapper = () => (
    <>
      <div style={{ cursor: 'pointer' }} onClick={deleteAudioRecording}>
        <Trash color="#30505D" />
      </div>
      <div className={classes.inputWrapper}>
        <RecordingDot />
        <Timer timestamp={Number(audioTimeStamp)} />
      </div>
    </>
  );

  const returnVideoRecordingWrapper = () =>
    videoCapturing && (
      <>
        <div />
        <div
          style={{
            backgroundColor: '#516272',
            borderRadius: '8px',
            width: 'fit-content',
            height: '36px',
            display: 'flex',
            padding: '10px 32px',
            alignItems: 'center',
            position: 'relative',
            cursor: 'text',
            gap: '10px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 700
          }}>
          <RecordingDot />
          <Timer
            timestamp={Number(videoTimeStamp)}
            countdownMilliseconds={MAX_VIDEO_RECORDING_TIME}
            countdownAction={handleMaximumVideoCaptureReached}
          />
        </div>
      </>
    );

  const renderPhotoButton = () =>
    cameraDialogDisplay === WEBCAM_MODE.PHOTO &&
    !capturedImage && (
      <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', cursor: 'pointer' }} onClick={captureImage}>
        <CapturePhoto />
      </div>
    );

  const renderVideoButton = () =>
    cameraDialogDisplay === WEBCAM_MODE.VIDEO &&
    !videoCapturing &&
    videoChunks.length === 0 && (
      <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', cursor: 'pointer' }} onClick={startVideoCapture}>
        <CaptureVideo />
      </div>
    );

  const renderStopButton = () =>
    cameraDialogDisplay === WEBCAM_MODE.VIDEO &&
    videoCapturing && (
      <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', cursor: 'pointer' }} onClick={stopVideoCapture}>
        <StopCaptureVideo />
      </div>
    );

  const renderRightPartFooter = () =>
    (capturedImage || videoChunks.length > 0) && (
      <>
        <div></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'right', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              padding: '8px 40px',
              backgroundColor: '#E8E8E8',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={resetVideoData}>
            {translateMessage({ ...messages.retake })}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              padding: '8px 40px',
              backgroundColor: color,
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={saveCapturedMedia}>
            {translateMessage({ ...messages.done })}
          </div>
        </div>
      </>
    );

  // const renderPlayVideoControl = () => {};

  const enableVideoErrorText = message => setLocalVideoError(message);
  const disableVideoErrorText = () => setLocalVideoError(null);

  const cameraDialog = () => (
    <Dialog open PaperProps={{ className: classes.paperProps }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '22px', fontWeight: 700, padding: '20px' }}>
        <div>{translateMessage({ ...messages.camera })}</div>
        <img
          style={{ cursor: 'pointer' }}
          onClick={videoCapturing || getVideoPreviewUrl() || capturedImage ? openStopConfirmationDialog : closeCameraDialog}
          src={Close}
          alt=""
        />
      </div>
      {localVideoError ? (
        <div className={classes.videoErrorWrapper}>
          <img src={NoCamera} className={classes.noCamera} alt="" />
          <div className={classes.videoError}>
            {localVideoError === MediaErrorType.DEVICE_NOT_FOUND && translateMessage({ ...messages.deviceNotFound })}
            {localVideoError === MediaErrorType.PERMISSION_DENIED && translateMessage({ ...messages.permissionDenied })}
            {localVideoError === MediaErrorType.VIDEO_SOURCE_ERROR && translateMessage({ ...messages.videoSourceError })}
          </div>
        </div>
      ) : capturedImage ? (
        <img src={capturedImage} className={classes.flash} alt="" />
      ) : getVideoPreviewUrl() ? (
        <video ref={videoPlayer} src={getVideoPreviewUrl()} controls />
      ) : (
        <>
          <Webcam
            // style={{ visibility: !streamVideoLoaded && cameraDialogDisplay === WEBCAM_MODE.VIDEO ? 'hidden' : 'visible' }}
            audio
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            onUserMedia={p => {
              disableVideoErrorText();
              setStreamVideoLoaded(true);
              console.log('onUserMedia ', p);
            }}
            onUserMediaError={error => {
              enableVideoErrorText(error.message);
              console.error('onUserMedia ', error.message);
            }}
            height="auto"
            muted // To avoid when I record a video, the speakers work also (I hear myself)
            audioConstraints={{ deviceId: props.localStorageDevices.audio ? { exact: props.localStorageDevices.audio } : undefined }}
            videoConstraints={{ deviceId: props.localStorageDevices.video ? { exact: props.localStorageDevices.video } : undefined }}
          />
          {!streamVideoLoaded && !webcamRef.current && cameraDialogDisplay === WEBCAM_MODE.VIDEO && (
            <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 40%)', height: '100%' }}>
              <Loading width={96} />
            </div>
          )}
        </>
      )}
      {!localVideoError && (
        <>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px' }}>
            <TogglePhotoVideoButton
              capturedImage={capturedImage}
              videoChunks={videoChunks}
              toggleCameraDialog={toggleCameraDialog}
              cameraDialogDisplay={cameraDialogDisplay}
              videoCapturing={videoCapturing}
            />
            {renderPhotoButton()}
            {!streamVideoLoaded && !webcamRef.current && cameraDialogDisplay === WEBCAM_MODE.VIDEO ? null : renderVideoButton()}
            {renderStopButton()}
            {renderRightPartFooter()}
            {returnVideoRecordingWrapper()}
            {/* {videoChunks.length > 0 && <div onClick={handleDownloadVideo}>Download video</div>} */}
          </div>
          {videoCaptureReached && (
            <div style={{ color: COLOR_MAP.criticalSeverity, fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: '20px' }}>
              {translateMessage({ ...messages.videoCaptureReached })}
            </div>
          )}
        </>
      )}
    </Dialog>
  );

  const openCameraDialog = mode => setCameraDialogDisplay(mode);

  const toggleCameraDialog = () => {
    if (cameraDialogDisplay === WEBCAM_MODE.VIDEO) {
      openCameraDialog(WEBCAM_MODE.PHOTO);
      resetVideoData();
      resetVideoTracks();
    } else {
      openCameraDialog(WEBCAM_MODE.VIDEO);
    }
  };

  const openStopConfirmationDialog = () => setStopConfirmationDialogDisplay(true);

  const closeStopConfirmationDialog = action => {
    if (action === 'yes') {
      closeDialog();
    }
    setStopConfirmationDialogDisplay(false);
  };

  const stopConfirmationDialog = () => (
    <SimpleDialog
      open={stopConfirmationDialogDisplay}
      onClose={closeStopConfirmationDialog}
      title={translateMessage({ ...messages.exitCameraTitle })}
      yesCaption="yes"
      noCaption="no"
      content={
        <>
          <p>
            {cameraDialogDisplay === WEBCAM_MODE.VIDEO
              ? translateMessage({ ...messages.videoDeletionConfirmation })
              : translateMessage({ ...messages.photoDeletionConfirmation })}
          </p>
          <p>{translateMessage({ ...messages.continueConfirmation })}</p>
        </>
      }
    />
  );

  return (
    <div className={classes.wrapper} ref={props.messageBarRef}>
      {/* https://codepen.io/mozmorris/pen/yLYKzyp?editors=0010 */}
      {audioCapturing && audioChunks.length ? returnAudioRecordingWrapper() : returnInputWrapper()}
      {/* {videoRecording && renderMediaElement()} */}
      <div className={classes.sendMessage} onClick={sendMessage}>
        <SendMessage disabled={checkIfNoAttachmentOrMessage() || props.offlineNetworkStatus} />
      </div>
      {props.attachmentPopupDisplay && (
        <AttachmentPopup
          open={props.attachmentPopupDisplay}
          close={closeSetAttachmentPopup}
          position={attachmentPopupPosition}
          uploadFile={uploadFile}
          sendGeolocation={props.sendGeolocation}
          displaySplashPopup={props.displaySplashPopup}
          record={startAudioCapture}
          openCameraDialog={openCameraDialog}
        />
      )}
      {!!cameraDialogDisplay && cameraDialog()}
      {stopConfirmationDialogDisplay && stopConfirmationDialog()}
    </div>
  );
};

MessageBar.propTypes = {
  sendMessage: PropTypes.func,
  sendGeolocation: PropTypes.func,
  messageAttachments: PropTypes.array,
  handleSetMessageAttachments: PropTypes.func,
  setAttachmentBox: PropTypes.func,
  setChatTyping: PropTypes.func,
  displaySplashPopup: PropTypes.func,
  attachmentPopupDisplay: PropTypes.object,
  setAttachmentPopupDisplay: PropTypes.func,
  offline: PropTypes.bool,
  messageBarRef: PropTypes.object,
  localStorageDevices: PropTypes.object,
  chatTextAreaValue: PropTypes.string,
  setChatTextAreaValue: PropTypes.func,
  removeAllAttachments: PropTypes.func,
  offlineNetworkStatus: PropTypes.bool
};

export default MessageBar;
