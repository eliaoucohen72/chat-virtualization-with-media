import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getLightedColor } from '../../HomePage/utils';
import PauseAudio from '../../../components/SVGComponents/pauseAudio';
import PlayAudio from '../../../components/SVGComponents/playAudio';
import { COLOR_MAP } from '../../App/constants';
import Download from '../../../components/SVGComponents/download';
import { convertSecondsToMMSS, getDurationAudioFile } from '../../../utils/commonFunctions';
import { isAudioFile } from '../../../sdk/src/utils/commonFunctions';

const AudioBubble = ({ message, isAac, currentPlayingAudio, setCurrentPlayingAudio }) => {
  const INITIAL_THUMB_LEFT = 60;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [thumbRefLeft, setThumbRefLeft] = useState(0);
  const audioRef = useRef(null);
  const thumbRef = useRef(null);
  const timelineRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);
  const [elapsedTimeWidth, setElapsedTimeWidth] = useState(0);
  const [downloadIconWidth, setDownloadIconWidth] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    async function getDurationAudio() {
      const dur = await getDurationAudioFile(message.attachment);
      setDuration(dur);
    }
    if (isAudioFile(message.attachment)) {
      getDurationAudio();
    }
  }, [message.attachment]);

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

  const onTimeUpdate = () => {
    if (audioRef.current.currentTime) {
      setElapsedTime(audioRef.current.currentTime);
      setThumbRefLeft((audioRef.current.currentTime / duration) * timelineRef.current.getBoundingClientRect().width);
    }
  };

  const onEnded = () => {
    setElapsedTime(0);
    setThumbRefLeft(0);
  };

  const renderTimeline = () => (
    <div
      ref={timelineRef}
      style={{
        backgroundColor: getLightedColor('#071F35', 0.6),
        height: '3px',
        width: `calc(100% - ${buttonWidth}px - ${elapsedTimeWidth}px - ${downloadIconWidth}px - ${20 * 3}px)`
      }}
    />
  );

  const renderThumb = () => (
    <div
      ref={thumbRef}
      style={{
        backgroundColor: COLOR_MAP.defaultFillingColor,
        width: '15px',
        height: '15px',
        borderRadius: '10px',
        position: 'absolute',
        left: `${INITIAL_THUMB_LEFT + thumbRefLeft}px`,
        zIndex: 1
      }}
    />
  );

  const renderElapsedTime = () => (
    <div
      ref={el => {
        if (el && elapsedTimeWidth === 0) {
          setElapsedTimeWidth(el.getBoundingClientRect().width);
        }
      }}>
      {convertSecondsToMMSS(elapsedTime)}
    </div>
  );

  const renderButton = () => (
    <div
      ref={el => {
        if (el) {
          setButtonWidth(el.getBoundingClientRect().width);
        }
      }}
      onClick={!audioRef.current || audioRef.current.paused ? play : pause}
      style={{
        cursor: 'pointer',
        zIndex: 2
      }}>
      {!audioRef.current || audioRef.current.paused ? <PlayAudio /> : <PauseAudio />}
    </div>
  );

  const renderAudioElement = () =>
    isAac ? (
      <audio id="audio-concat-bubble" ref={audioRef} controls onTimeUpdate={onTimeUpdate} onEnded={onEnded}>
        <source src={message.attachment} type="audio/mp4" />
      </audio>
    ) : (
      <audio id="audio-concat-bubble" ref={audioRef} controls src={message.attachment} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
    );

  const renderDownloadIcon = () => (
    <a
      ref={el => {
        if (el) {
          setDownloadIconWidth(el.getBoundingClientRect().width);
        }
      }}
      href={message.attachment}
      download="true">
      <Download color="#30505D" />
    </a>
  );

  return (
    <>
      {renderAudioElement()}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', justifyContent: 'space-between' }}>
        {renderThumb()}
        {renderButton()}
        {renderTimeline()}
        {renderElapsedTime()}
        {renderDownloadIcon()}
      </div>
    </>
  );
};
AudioBubble.propTypes = {
  message: PropTypes.object,
  isAac: PropTypes.bool,
  currentPlayingAudio: PropTypes.object,
  setCurrentPlayingAudio: PropTypes.func
};

export default AudioBubble;
