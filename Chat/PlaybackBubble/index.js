import React, { useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { TinyColor } from '@ctrl/tinycolor';
import { style } from './style';
import { GlobalContext } from '../../App/context';
import Back from '../../../components/SVGComponents/back';
import { LANGUAGES } from '../../../sdk/src/utils/enums';
import { translateMessage } from '../../../i18n';
import translationMessages from './messages';
import { convertSecondsToMMSS, returnFormattedTime } from '../../../utils/commonFunctions';
import { COLOR_MAP } from '../../App/constants';
import PlayPlayback from '../../../components/SVGComponents/playPlayback';
import PausePlayback from '../../../components/SVGComponents/pausePlayback';

const useStyles = makeStyles(style);

const PlaybackBubble = ({ messages, isFirst, sender, unConcatBubble, currentPlayingAudio, setCurrentPlayingAudio, chatPopoverMode }) => {
  const { color, language } = useContext(GlobalContext);
  // const [audioTimeStamp, setAudioTimeStamp] = useState(null);
  const [source, setSource] = useState(messages[0].attachment);
  const [index, setIndex] = useState(0);
  const [elapsedDuration, setElapsedDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [thumbRefLeft, setThumbRefLeft] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const audioRef = useRef(null);
  const thumbRef = useRef(null);
  const totalDuration = messages.reduce((acc, o) => acc + Number(o.duration), 0);
  const isIncoming = messages[0].sender === 'them';

  const onEnded = () => {
    setCurrentTime(0);
    setElapsedDuration(prevState => prevState + audioRef.current.duration);
    if (messages[index + 1]) {
      setSource(messages[index + 1].attachment);
      setIndex(index + 1);
      setTimeout(() => {
        audioRef.current.play();
      }, 1000);
    } else {
      setSource(messages[0].attachment);
      setIndex(0);
      setThumbRefLeft(0);
      setElapsedDuration(0);
      setElapsedTime(0);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current.currentTime) {
      setElapsedTime(elapsedDuration + audioRef.current.currentTime);
      if (currentTime < audioRef.current.currentTime) {
        const currentPosition = ((elapsedDuration + audioRef.current.currentTime) * timelineWidth) / totalDuration;
        setThumbRefLeft(currentPosition);
        setCurrentTime(audioRef.current.currentTime);
      }
    }
  };

  const renderBorderRadius = () => {
    if (isFirst) {
      if (sender === 'them') {
        return '16px 0px 16px 16px';
      }
      return '0px 16px 16px 16px';
    }

    return '16px';
  };

  const classesProps = {
    isAudio: true,
    organizationProfileColor: color,
    borderRadius: renderBorderRadius(),
    isIncoming,
    chatPopoverMode,
    color,
    thumbRefLeft
  };
  const classes = useStyles(classesProps);

  const isMultiSession = messages.length > 1;

  const unConcat = () => unConcatBubble(messages[0]);

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const play = () => {
    if (audioRef.current) {
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
      }
      audioRef.current.play();
      setCurrentPlayingAudio(audioRef.current);
    }
  };

  const renderTimeline = () => (
    <div
      ref={el => {
        if (el) {
          setTimelineWidth(el.getBoundingClientRect().width);
        }
      }}
      className={classes.timeline}
    />
  );

  const renderTimelineBlanks = () =>
    messages
      .filter((e, idx) => idx !== 0)
      .map((e, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: !isIncoming ? new TinyColor(color).lighten(30).toString() : COLOR_MAP.middleGrey,
            width: '5px',
            height: '4px',
            position: 'absolute',
            top: 0,
            left: `${(messages.filter((m, i) => i <= idx).reduce((acc, o) => acc + o.duration, 0) / totalDuration) * timelineWidth}px`
          }}
        />
      ));

  const renderThumb = () => <div ref={thumbRef} className={classes.thumb} />;

  const renderElapsedTimeAndPttNumber = () => (
    <div className={classes.elapsedTime}>
      <div>{elapsedTime > 0 ? convertSecondsToMMSS(elapsedTime) : ' '}</div>
      {isMultiSession ? (
        <div className={classes.pttNumber}>
          {!audioRef.current || audioRef.current.paused ? `${messages.length} PTTs` : messages[index].getRealNickname()}
        </div>
      ) : (
        <div>{convertSecondsToMMSS(messages[0].duration)}</div>
      )}
    </div>
  );

  const renderButton = () => (
    <div onClick={!audioRef.current || audioRef.current.paused ? play : pause} className={classes.button}>
      {!audioRef.current || audioRef.current.paused ? <PlayPlayback /> : <PausePlayback />}
    </div>
  );

  const renderHeader = () => (
    <div className={classes.header}>
      <div>{isMultiSession ? translateMessage({ ...translationMessages.pttSession }) : translateMessage({ ...translationMessages.pttPlayback })}</div>
      {isMultiSession && (
        <div className={classes.back} onClick={unConcat}>
          <Back rtl={language !== LANGUAGES.HE} />
        </div>
      )}
    </div>
  );

  const renderSendingDate = () => <div className={classes.sendingDate}>{returnFormattedTime(messages[0].sendingDate)}</div>;

  const renderAudioElement = () => (
    <audio
      id="audio-concat-bubble"
      ref={audioRef}
      className={classes.soundAttachment}
      controls
      src={source}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
    />
  );

  return (
    <div className={classes.wrapper}>
      {renderHeader()}
      {renderAudioElement()}
      <div className={classes.footerWrapper}>
        {renderButton()}
        <div className={classes.footer}>
          <div>
            {renderThumb()}
            {renderTimeline()}
            {renderTimelineBlanks()}
          </div>
          {renderElapsedTimeAndPttNumber()}
        </div>
      </div>
      {renderSendingDate()}
    </div>
  );
};
PlaybackBubble.propTypes = {
  messages: PropTypes.array,
  isFirst: PropTypes.bool,
  sender: PropTypes.string,
  unConcatBubble: PropTypes.func,
  currentPlayingAudio: PropTypes.object,
  setCurrentPlayingAudio: PropTypes.func,
  chatPopoverMode: PropTypes.bool
};

export default PlaybackBubble;
