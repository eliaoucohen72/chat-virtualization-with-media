import React, { useEffect, useState, memo, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { CellMeasurer, CellMeasurerCache, List, AutoSizer } from 'react-virtualized';

import translationMessages from './messages';
import Bubble from '../Bubble';
import DateSeparator from '../DateSeparator';
import { style } from './style';
import { contactTypes } from '../../../sdk/src/contacts/enums';
import { translateMessage } from '../../../i18n';
import { GlobalContext } from '../../App/context';
import { LANGUAGES } from '../../../sdk/src/utils/enums';
import { isPlaybackMessage, returnActivityDate, returnFormattedTime } from '../../../utils/commonFunctions';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../../sdk/src/general/enums';
import { convertSecondsToHHMMSS } from '../../HomePage/utils';
import { AFFILIATION_ACTIONS, FETCH_MESSAGES_DIRECTION } from '../../../sdk/src/xmpp/enums';
import { COLOR_MAP } from '../../App/constants';
import './cssStyle.css';
import Loading from '../../../components/SVGComponents/loading';
import PlaybackBubble from '../PlaybackBubble';
import { LANGUAGE_DIRECTIONS } from '../../App/enums';
import { isImageFile, isVideoFile } from '../../../sdk/src/utils/commonFunctions';
import { MEDIA_BUBBLE_MAX_HEIGHT, MEDIA_BUBBLE_MAX_WIDTH } from '../constants';
import Loader from '../../../components/Loader';

const useStyles = makeStyles(style);

const ChatContent = props => {
  const { fetchChatHistory, scrollToIndex, setScrollToIndex, loading, listRef } = props;
  const { language } = useContext(GlobalContext);
  const [attachmentBoxHeight, setAttachmentBoxHeight] = useState(props.attachmentBoxHeight);
  const [hover, setHover] = useState(false);
  const [pttPlaybackList, setPttPlaybackList] = useState([]);
  const classesProps = {
    attachmentBoxHeight,
    isBigScreen: props.isBigScreen,
    isBot: props.contact.isBot
  };
  const [firstScrollTop, setFirstScrollTop] = useState(true);
  const classes = useStyles(classesProps);
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 80
  });
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [length, setLength] = useState(props.contact.messages.length);

  useEffect(() => {
    console.debug('UI.useEffect', 'ChatContent', 'length', length, 'props.contact.messages.length', props.contact.messages.length);
    if (length !== props.contact.messages.length) {
      setTimeout(() => {
        setScrollToIndex(props.contact.messages.length - 1);
        // console.log('aaa ', listRef.current);
        // const listNode = listRef.current.Grid._scrollingContainer;
        // listNode.scrollTop = listNode.scrollHeight;
        setLength(props.contact.messages.length);
      }, 1000);
    }
  }, [length, listRef, props.contact.messages.length, setScrollToIndex]);

  useEffect(() => {
    console.debug('UI.useEffect', 'ChatContent', 'props.attachmentBoxHeight', props.attachmentBoxHeight);
    setAttachmentBoxHeight(props.attachmentBoxHeight);
  }, [props.attachmentBoxHeight]);

  // By default useEffect run first time and then on change of dependencies.
  useEffect(() => {
    console.debug('UI.useEffect', 'ChatContent', 'props.contact.unreadCount', props.contact.unreadCount);
    props.resetChatNumberMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.contact.unreadCount]);

  useEffect(() => {
    console.debug('UI.useEffect', 'ChatContent', 'props.contact.messages');

    // Get all messages
    const list = props.contact.messages;
    // Create a list like
    // list2 = [message, message, 'break', message, message, message]
    const list2 = [];
    // Create a list like
    // list3 = [{concat: true, elements: [message, message]}, {concat: true, elements: [message, message, message]}]
    const list3 = [];
    let list4 = [];
    let concatDuration = 0;
    let count = 0;

    list.forEach((e, index) => {
      const next = list[index + 1];
      if (isPlaybackMessage(e)) {
        const { duration } = e;
        concatDuration += duration;

        if (next && isPlaybackMessage(next) && concatDuration < 60) {
          if (count === 4 || new Date(next.sendingDate).getTime() - new Date(e.sendingDate).getTime() >= 60000) {
            list2.push(e);
            list2.push('break');
            concatDuration = 0;
            count = 0;
          } else if (new Date(next.sendingDate).getTime() - new Date(e.sendingDate).getTime() < 60000) {
            list2.push(e);
            count += 1;
          }
        } else {
          list2.push(e);
          list2.push('break');
          count = 0;
          concatDuration = 0;
        }
      }
    });

    // console.log('aaa STEP2');
    // console.log('aaa list2 ', list2);

    list2.forEach((e, i) => {
      if (i === 0 || list2[i - 1] === 'break') {
        list3.push([e]);
      } else if (e !== 'break') {
        list3[list3.length - 1].push(e);
      }
    });
    // console.log('aaa STEP3');
    // console.log('aaa list3 ', list3);

    list4 = list3.filter(e => e.length > 1).map(e => ({ concat: true, elements: e }));

    // console.log('aaa list4 ', list4);

    // console.debug('playbackListWithApproximateDuration created ', list4);
    setPttPlaybackList(list4);
  }, [props.contact.messages]);

  /**
   * Parse the messages array to display the list sorted by day
   *
   * @param  {array} messages
   */
  const renderedParsedMessages = useMemo(() => {
    const messageList = props.contact.messages;
    let nickname = '';
    let sendingDate = '';
    let activityType = '';

    const list = messageList.map((message, index) => {
      const newMessage = message;
      newMessage.nickname = newMessage.getRealNickname();

      if ((isImageFile(message.attachment) || isVideoFile(message.attachment)) && message.mediaWidth && message.mediaHeight) {
        const { mediaWidth, mediaHeight } = message;
        const widthPercent = MEDIA_BUBBLE_MAX_WIDTH / mediaWidth;
        const heightPercent = MEDIA_BUBBLE_MAX_HEIGHT / mediaHeight;

        const percent = heightPercent < widthPercent ? heightPercent : widthPercent;

        const destWidth = mediaWidth * percent;
        const destHeight = mediaHeight * percent;
        newMessage.height = destHeight;
        newMessage.width = destWidth;
      }

      if (newMessage.nickname !== nickname || newMessage.activityType !== activityType) {
        newMessage.isFirst = true;
        nickname = newMessage.nickname;
        activityType = newMessage.activityType;
      }

      const oldDate = sendingDate;
      const newDate = returnActivityDate(newMessage.sendingDate, language);
      if (oldDate !== newDate) {
        newMessage.isFirst = true;
        newMessage.dateSeparator = true;
        sendingDate = newDate;
      }
      if (messageList[index + 1] && messageList[index + 1].wasDisplayed) {
        newMessage.wasDisplayed = true;
      }
      return newMessage;
    });
    return list;
  }, [language, props.contact.messages]);

  // const isTheSameSender = (index, parsedMessages) => parsedMessages[index].nickname === parsedMessages[index - 1].nickname;
  const isTheSameSender = (index, parsedMessages) =>
    parsedMessages.length <= 1 || !index ? true : parsedMessages[index].sender === parsedMessages[index - 1].sender;

  const returnBubblePaddingByScreenResolutionAndSender = sender => {
    if (sender !== 'them') {
      if (props.chatPopoverMode || !props.isBigScreen) {
        return language === LANGUAGES.HE ? '0 0 0 20px' : '0 20px 0 0';
      }
      return language === LANGUAGES.HE ? '0 0 0 100px' : '0 100px 0 0';
    }
    if (props.chatPopoverMode || !props.isBigScreen) {
      return language === LANGUAGES.HE ? '0 20px 0 0' : '0 0 0 20px';
    }
    return language === LANGUAGES.HE ? '0 100px 0 0' : '0 0 0 100px';
  };

  const renderSenderNickname = (contact, message) => {
    if (message.sender === 'me') {
      return translateMessage({ ...translationMessages.you });
    }
    if (contact.contactType === contactTypes.group) {
      return message.nickname;
    }
    return contact.nickname;
  };

  const renderActivityCallLog = message => {
    if (
      message.activityStatus === ACTIVITY_STATUSES.COMPLETED ||
      (!message.activityStatus &&
        (message.activityType === ACTIVITY_TYPES.SOS ||
          message.activityType === ACTIVITY_TYPES.WORKING_ALONE ||
          message.activityType === ACTIVITY_TYPES.WORKING_AT_RISK ||
          message.activityType === ACTIVITY_TYPES.MAN_DOWN))
    ) {
      return (
        <div className={classes.activityCallLogWrapper}>
          <div className={classes.activityTime}>{returnFormattedTime(message.sendingDate)}</div>
          <div className={classes.flexRowCenter}>
            <div className={`${classes.flexRowCenter} ${classes.s15w600}`}>
              <div>{message.activityType}</div>&nbsp;
              <div>{translateMessage({ ...translationMessages.by })}</div>&nbsp;
              <div>{renderSenderNickname(props.contact, message)}</div>
              &nbsp; &nbsp;
            </div>
            {message.activityStatus === ACTIVITY_STATUSES.COMPLETED && (
              <div className={classes.s15w400grey}>{convertSecondsToHHMMSS(message.duration)}</div>
            )}
          </div>
        </div>
      );
    }

    if (message.activityStatus === ACTIVITY_STATUSES.MISSED) {
      return (
        <div className={classes.activityCallLogWrapper}>
          <div className={classes.activityTime}>{returnFormattedTime(message.sendingDate)}</div>
          <div className={classes.flexRowCenter}>
            <div className={`${classes.flexRowCenter} ${classes.s15w600}`}>
              <div>
                {message.sender === 'me'
                  ? translateMessage({ ...translationMessages.missedCallTo })
                  : translateMessage({ ...translationMessages.missedCallFrom })}
              </div>
              &nbsp;
              <div>
                {props.contact.contactType === contactTypes.group ? message.nickname : /* get nickname by contactId */ props.contact.nickname}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderAffiliationLog = message => {
    let content = '';
    if (message.isSelfAffiliation) {
      content =
        message.affiliationAction === AFFILIATION_ACTIONS.JOINED
          ? translateMessage({ ...translationMessages.youJoinedTheGroup })
          : translateMessage({ ...translationMessages.youLeftTheGroup });
    } else {
      content =
        message.affiliationAction === AFFILIATION_ACTIONS.JOINED
          ? `${message.nickname}${translateMessage({ ...translationMessages.joinedTheGroup })}`
          : `${message.nickname}${translateMessage({ ...translationMessages.leftTheGroup })}`;
    }

    return (
      <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', fontWeight: 400 }}>
        <div style={{ fontSize: '13px', color: COLOR_MAP.darkGrey }}>{returnFormattedTime(message.sendingDate)}</div>
        <div style={{ fontSize: '15px' }}>{content}</div>
      </div>
    );
  };

  const onMouseOver = index => setHover(index);
  const onMouseLeave = () => setHover(false);

  const renderBubble = (rowData, index, parsedMessages, isTempMessage) => (
    <div style={{ padding: returnBubblePaddingByScreenResolutionAndSender(isTempMessage ? 'me' : rowData.sender) }}>
      <Bubble
        index={index}
        listRef={listRef}
        isHovered={hover === index}
        isGroupMessage={props.contact.contactType === contactTypes.group}
        message={isTempMessage ? props.tempMessage : rowData}
        isTheSameSender={isTempMessage ? true : isTheSameSender(index, parsedMessages)}
        flyToSpecificAddress={props.flyToSpecificAddress}
        mapCapability={props.mapCapability}
        groupMembers={props.contact.members ? [...props.contact.members].map(m => m[1]) : []}
        searchInput={props.searchInput}
        chatPopoverMode={props.chatPopoverMode}
        handleSetMessageAttachments={props.handleSetMessageAttachments}
        handleDialogOpen={props.handleDialogOpen}
        setForwardMessage={props.setForwardMessage}
        setReplyMessage={props.setReplyMessage}
        contact={props.contact}
        jumpToMessage={props.jumpToMessage}
        disableForward={rowData.isPlaybackMessage}
        currentPlayingAudio={currentPlayingAudio}
        setCurrentPlayingAudio={setCurrentPlayingAudio}
      />
    </div>
  );

  const unConcatBubble = firstElement => {
    const list = pttPlaybackList.map(e => (e.elements[0].id === firstElement.id ? { ...e, concat: false } : e));
    setPttPlaybackList(list);
  };

  const renderPlaybackBubble = messages => {
    const { isFirst, sender } = messages[0];
    return (
      <div style={{ padding: returnBubblePaddingByScreenResolutionAndSender(sender) }}>
        <PlaybackBubble
          messages={messages}
          isFirst={isFirst}
          sender={sender}
          unConcatBubble={unConcatBubble}
          currentPlayingAudio={currentPlayingAudio}
          setCurrentPlayingAudio={setCurrentPlayingAudio}
          chatPopoverMode={props.chatPopoverMode}
        />
      </div>
    );
  };

  // eslint-disable-next-line no-shadow
  const rowRenderer = ({ index, style, key, parent, parsedMessages, nonPlaybackMessages }) => {
    const rowData = parsedMessages[index];
    const isConcatBubble = pttPlaybackList.find(e => e.elements.find(x => x.id === rowData.id) && e.concat);
    const isFirstMultiPlaybackBubble = pttPlaybackList.find(e => e.elements[0].id === rowData.id && e.concat);

    return (
      <CellMeasurer key={key} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
        {({ measure, registerChild }) => (
          <div
            ref={registerChild}
            onLoad={measure}
            // onTransitionEnd={measure}
            // onAnimationEnd={measure}
            style={{
              ...style,
              direction: language === LANGUAGES.HE ? LANGUAGE_DIRECTIONS.RTL : LANGUAGE_DIRECTIONS.LTR /*, height: rowHeightMap.get(rowData.id) */
            }}
            onMouseOver={() => onMouseOver(index)}
            onMouseLeave={onMouseLeave}
            onFocus={() => 0}>
            <div className={classes.padding020}>{rowData.dateSeparator && <DateSeparator date={rowData.sendingDate} />}</div>
            {rowData.isActivity ? (
              renderActivityCallLog(rowData)
            ) : rowData.affiliationAction ? (
              renderAffiliationLog(rowData)
            ) : // Playback
            isPlaybackMessage(rowData) ? (
              //Single playback
              !isFirstMultiPlaybackBubble && !isConcatBubble ? (
                renderPlaybackBubble([rowData])
              ) : isFirstMultiPlaybackBubble ? (
                // Multi playback
                renderPlaybackBubble(isConcatBubble.elements)
              ) : null
            ) : index === parsedMessages.length - 1 ? (
              props.tempMessage ? (
                <>
                  {renderBubble(rowData, index, parsedMessages)}
                  {renderBubble(rowData, index, parsedMessages, true)}
                </>
              ) : nonPlaybackMessages.map(e => e.id).includes(rowData.id) ? (
                renderBubble(rowData, index, parsedMessages)
              ) : null
            ) : nonPlaybackMessages.map(e => e.id).includes(rowData.id) ? (
              renderBubble(rowData, index, parsedMessages)
            ) : null}
          </div>
        )}
      </CellMeasurer>
    );
  };

  const onRowsRendered = data => {
    const { startIndex, stopIndex } = data;
    if (scrollToIndex !== -1 && (scrollToIndex >= startIndex || scrollToIndex <= stopIndex)) {
      setScrollToIndex(-1);
    }
  };

  /**
   * Render the chat messages
   */
  const renderMessages = () => {
    const parsedMessages = renderedParsedMessages;
    const concatMessageIds = [];
    pttPlaybackList
      .filter(e => e.concat)
      .map(e => e.elements)
      .forEach(e => {
        e.forEach(element => {
          concatMessageIds.push(element.id);
        });
      });

    const nonPlaybackMessages = parsedMessages.filter(e => !isPlaybackMessage(e));

    return (
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            estimatedRowSize={80}
            onScroll={onScroll}
            style={{ paddingBottom: '30px' }}
            scrollToIndex={scrollToIndex}
            onRowsRendered={onRowsRendered}
            height={height}
            width={width}
            rowCount={parsedMessages.length}
            rowRenderer={p => rowRenderer({ ...p, parsedMessages, nonPlaybackMessages })}
            rowHeight={cache.rowHeight}
          />
        )}
      </AutoSizer>
    );
  };

  const renderFetchingTopHistory = () => (
    <div className={classes.loadingTop}>
      <div>
        <Loading color={COLOR_MAP.defaultFontColor} />
      </div>
      <div>{translateMessage({ ...translationMessages.loadingMoreMessages })}</div>
    </div>
  );

  const renderFetchingBottomHistory = () => (
    <div className={classes.loadingBottom}>
      <div>
        <Loading color={COLOR_MAP.defaultFontColor} />
      </div>
      <div>{translateMessage({ ...translationMessages.loadingMoreMessages })}</div>
    </div>
  );

  const onScroll = e => {
    if (e.scrollTop === 0) {
      // To prevent the scroll top reached on opening
      if (firstScrollTop) {
        setFirstScrollTop(false);
      } else {
        fetchChatHistory(props.contact.chatBox, new Date().toISOString(), FETCH_MESSAGES_DIRECTION.BACKWARD);
        // Don't jump to first new message if all history fetched
        // if (!props.contact.chatBox.isAllHistoryFetched()) {
        // setScrollToIndex(MAM_PAGE_SIZE);
        // }
      }
    }
    // if (listRef && listRef.current) {
    //   console.log('bbb e.scrollTop ', e.scrollTop);
    //   console.log('bbb listRef.current.Grid.state.scrollTop ', listRef.current.Grid.state.scrollTop);
    //   if (e.scrollTop === listRef.current.Grid.state.scrollTop) {
    //     console.log('bbb scroll bottom reached');
    // fetchChatHistory(props.searchMessageSendingTime, FETCH_MESSAGES_DIRECTION.FORWARD);
    // setScrollToIndex(-1);
    // }
    // }
  };

  return props.contact.messages ? (
    <>
      {!props.contact.messages.length ? (
        <div className={classes.noContent}>
          {props.isFetchingChatTopHistory && renderFetchingTopHistory()}
          {translateMessage({ ...translationMessages.noMessage })}
        </div>
      ) : (
        <div className={classes.messageWrapper}>
          <>
            {loading && (
              <div style={{ zIndex: 1, height: '100%', position: 'absolute', width: '100%', backgroundColor: 'white' }}>
                <Loader />
              </div>
            )}
            {props.isFetchingChatTopHistory && renderFetchingTopHistory()}
            {renderMessages()}
            {props.isFetchingChatBottomHistory && renderFetchingBottomHistory()}
          </>
        </div>
      )}
    </>
  ) : null;
};

ChatContent.propTypes = {
  contact: PropTypes.object,
  resetChatNumberMessage: PropTypes.func,
  attachmentBoxHeight: PropTypes.number,
  flyToSpecificAddress: PropTypes.func,
  mapCapability: PropTypes.bool,
  isBigScreen: PropTypes.bool,
  chatPopoverMode: PropTypes.bool,
  searchInput: PropTypes.string,
  tempMessage: PropTypes.object,
  fetchChatHistory: PropTypes.func,
  isFetchingChatTopHistory: PropTypes.bool,
  isFetchingChatBottomHistory: PropTypes.bool,
  scrollToIndex: PropTypes.number,
  setScrollToIndex: PropTypes.func,
  handleSetMessageAttachments: PropTypes.func,
  handleDialogOpen: PropTypes.func,
  setForwardMessage: PropTypes.func,
  setReplyMessage: PropTypes.func,
  jumpToMessage: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  searchMessageSendingTime: PropTypes.func,
  loading: PropTypes.bool,
  listRef: PropTypes.object
  // setScrollMovement: PropTypes.func
};

export default memo(ChatContent);
