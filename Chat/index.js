import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { useMediaQuery } from 'react-responsive';
import Draggable from 'react-draggable';
import { Dialog, Paper } from '@mui/material';

import UserBar from './UserBar';
import MessageBar from './MessageBar';
import ChatContent from './ChatContent';
import { style } from './style';
import Loader from '../../components/Loader';
import AttachmentBox from './AttachmentBox';
import ContactDetails from './ContactDetails';
import { BIG_SCREEN_WIDTH } from './constants';
import { contactTypes } from '../../sdk/src/contacts/enums';
import SearchChat from './SearchChat';
import { GlobalContext } from '../App/context';
import { checkFeaturePermission } from '../../sdk/src/utils/profileUtils';
import { Capabilities } from '../../sdk/src/general/enums';
import messages from './messages';
import { translateMessage } from '../../i18n';
import { WidebridgeSDK } from '../../sdk/src';
import { FETCH_MESSAGES_DIRECTION } from '../../sdk/src/xmpp/enums';
import { sleep } from '../../sdk/src/utils/commonFunctions';

const useStyles = makeStyles(style);

function PaperComponent(props) {
  return <Paper {...props} style={{ margin: 0, maxHeight: '100%', width: '500px', height: '360px', borderRadius: '10px', overflow: 'hidden' }} />;
}

const widebridgeSdk = WidebridgeSDK.getInstance();

const Chat = props => {
  const { addChatBoxToContact, setScrollToIndex } = props;
  const { capabilities } = useContext(GlobalContext);
  const [attachmentBox, setAttachmentBox] = useState(false);
  const [attachmentBoxHeight, setAttachmentBoxHeight] = useState(0);
  const [contactDetailsDisplay, setContactDetailsDisplay] = useState(false);
  const [searchChatDisplay, setSearchChatDisplay] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [groupMembers, setGroupMembers] = useState(new Map());
  const [contactMessages, setContactMessages] = useState([]);
  const [previousContactId, setPreviousContactId] = useState(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef();

  const classesProps = {
    sidebarCollapsed: props.sidebarCollapsed,
    isAttachmentBox: props.messageAttachments.length || props.replyMessage,
    attachmentBoxHeight,
    chatPopoverMode: props.chatPopoverMode,
    isBot: props.contact && props.contact.isBot
  };
  const classes = useStyles(classesProps);

  useEffect(() => {
    async function addChatBox(contact) {
      await addChatBoxToContact(contact);
    }

    if (props.contact && !props.contact.chatBox) {
      console.debug('UI.useEffect', 'Chat', 'props.contact', props.contact, 'addChatBox');
      addChatBox(props.contact);
    }
    if (props.contact && props.contact.contactType === contactTypes.group) {
      console.debug('UI.useEffect', 'Chat', 'props.contact', props.contact, 'fetchMembers');
      fetchMembers();
    }

    if (props.contact && props.contact.chatBox && props.chatFirstMount) {
      props.setChatFirstMount(false);
    }

    // Reset searchMessageSendingTime
    // props.setSearchMessageSendingTime(new Date().toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chatFirstMount ? props.contact : props.contact ? props.contact.id : null]);

  useEffect(() => {
    if (props.contact && props.contact.chatBox && previousContactId !== props.contact.id) {
      setLoading(true);
      console.debug('UI.useEffect', 'Chat', 'contact changed');
      sleep(1000).then(() => {
        console.log('Chat scrollToIndex');
        setScrollToIndex(props.contact.chatBox.getMessages().length - 1);
        // console.log('aaa ', listRef.current);
        // const listNode = listRef.current.Grid._scrollingContainer;
        // listNode.scrollTop = listNode.scrollHeight;
        setPreviousContactId(props.contact.id);
        sleep(1000).then(() => {
          setLoading(false);
        });
      });
    }
  }, [previousContactId, props.contact, setScrollToIndex]);

  useEffect(
    () => {
      if (props.contact && props.contact.messages && !props.contact.messages.length && !props.contact.chatBox.isFetchingHistory) {
        console.debug('UI.useEffect', 'Chat', 'props.contact.messages');
        props.fetchChatHistory(props.contact.chatBox, new Date().toISOString(), FETCH_MESSAGES_DIRECTION.BACKWARD);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    props.contact && props.contact.messages ? [props.contact.messages] : [null]
  );

  useEffect(() => {
    if (props.contact && props.contact.contactType === contactTypes.group && contactDetailsDisplay) {
      console.debug('UI.useEffect', 'Chat', 'contactDetailsDisplay', contactDetailsDisplay, 'fetchMembers');
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.contact, contactDetailsDisplay]);

  const fetchMembers = useCallback(async () => {
    await props.contact.membersFetched;
    setGroupMembers(new Map());
    const members = await widebridgeSdk.xmppManager.fetchAllGroupMembers(props.contact.id);
    // console.log('members-chat', members);
    setGroupMembers(members);
  }, [props.contact]);

  const jumpToMessage = message => {
    props.jumpToMessage(message);
    closeSearchChat();
  };

  const mapCapability = checkFeaturePermission(capabilities, Capabilities.MAP);
  const isBigScreen = useMediaQuery({ query: `(min-width: ${BIG_SCREEN_WIDTH})` });

  const closeContactDetails = () => setContactDetailsDisplay(false);

  const closeSearchChat = () => {
    setSearchInput('');
    setSearchChatDisplay(false);
  };

  const openContactDetails = () => {
    closeSearchChat();
    setContactDetailsDisplay(true);
  };

  const openSearchChat = () => {
    closeContactDetails();
    setSearchChatDisplay(true);
  };

  const onChangeSearchInput = value => {
    const trimmedValue = value.trim();
    setSearchInput(trimmedValue);
    if (trimmedValue !== '') {
      props.contact.chatBox.searchInMessages(trimmedValue).then(res => {
        setContactMessages(res.messages);
      });
    }
  };

  const renderChatComponent = () => (
    <div className={classes.subWrapper} id="chat-draggable-popover">
      <UserBar
        contact={props.contact}
        groupMembers={groupMembers}
        openChat={props.openChat}
        goToMap={props.goToMap}
        contactDetailsDisplay={contactDetailsDisplay}
        openContactDetails={openContactDetails}
        mapCapability={mapCapability}
        chatPopoverMode={props.chatPopoverMode}
        closeChatPopover={props.closeChatPopover}
        maximizeChatPopover={props.maximizeChatPopover}
        muteContact={props.muteContact}
        unmuteContact={props.unmuteContact}
        chatNotificationSound={props.chatNotificationSound}
        isIncomingMessageToneMuted={props.isIncomingMessageToneMuted}
        handleMutedIncomingMessageTone={props.handleMutedIncomingMessageTone}
        openSearchChat={openSearchChat}
        userProfile={props.userProfile}
        ptvCall={props.ptvCall}
        getLastSeenOfContact={props.getLastSeenOfContact}
      />
      <ChatContent
        contact={props.contact}
        resetChatNumberMessage={props.resetChatNumberMessage}
        attachmentBoxHeight={attachmentBoxHeight}
        flyToSpecificAddress={props.flyToSpecificAddress}
        mapCapability={mapCapability}
        openContactDetails={openContactDetails}
        closeContactDetails={closeContactDetails}
        isBigScreen={isBigScreen}
        chatPopoverMode={props.chatPopoverMode}
        searchInput={searchInput}
        tempMessage={props.tempMessage}
        fetchChatHistory={props.fetchChatHistory}
        isFetchingChatTopHistory={props.isFetchingChatTopHistory}
        isFetchingChatBottomHistory={props.isFetchingChatBottomHistory}
        scrollToIndex={props.scrollToIndex}
        setScrollToIndex={props.setScrollToIndex}
        handleSetMessageAttachments={props.handleSetMessageAttachments}
        handleDialogOpen={props.handleDialogOpen}
        setForwardMessage={props.setForwardMessage}
        setReplyMessage={props.setReplyMessage}
        jumpToMessage={jumpToMessage}
        loading={loading}
        listRef={listRef}
      />
      {props.messageAttachments.length || props.replyMessage ? (
        <AttachmentBox
          messageAttachments={props.messageAttachments}
          setAttachmentBoxHeight={setAttachmentBoxHeight}
          chatPopoverMode={props.chatPopoverMode}
          removeAttachment={props.removeAttachment}
          replyMessage={props.replyMessage}
          setReplyMessage={props.setReplyMessage}
        />
      ) : null}
      {!props.contact.isBot && (
        <MessageBar
          sendMessage={props.sendMessage}
          sendGeolocation={props.sendGeolocation}
          messageAttachments={props.messageAttachments}
          handleSetMessageAttachments={props.handleSetMessageAttachments}
          attachmentBox={attachmentBox}
          setAttachmentBox={setAttachmentBox}
          setChatTyping={props.setChatTyping}
          displaySplashPopup={props.displaySplashPopup}
          attachmentPopupDisplay={props.attachmentPopupDisplay}
          setAttachmentPopupDisplay={props.setAttachmentPopupDisplay}
          offline={props.offline}
          localStorageDevices={props.localStorageDevices}
          chatTextAreaValue={props.chatTextAreaValue}
          setChatTextAreaValue={props.setChatTextAreaValue}
          removeAllAttachments={props.removeAllAttachments}
          offlineNetworkStatus={props.offlineNetworkStatus}
        />
      )}
    </div>
  );

  const renderParentGroupMessage = () => <div className={classes.parentGroupMessage}>{translateMessage({ ...messages.parentGroupMessage })}</div>;

  const renderMinimizedChat = () => (
    <Draggable handle="#chat-draggable-popover" bounds="parent">
      <Dialog
        disableEnforceFocus
        hideBackdrop
        open
        PaperComponent={PaperComponent}
        style={{
          top: '30%',
          left: '30%'
        }}
        className={classes.dialog}>
        {renderChatComponent()}
      </Dialog>
    </Draggable>
  );

  const renderMaximizedChat = () => (
    <div style={{ display: 'flex', height: '100%' }}>
      {renderChatComponent()}
      {contactDetailsDisplay && !props.chatPopoverMode && !props.contact.isBot && (
        <div className={classes.bgcGrey4}>
          <ContactDetails
            contact={props.contact}
            groupMembers={groupMembers}
            closeContactDetails={closeContactDetails}
            contactMap={props.contactMap}
            handleSelectedContact={props.handleSelectedContact}
            userProfile={props.userProfile}
            handleUpdateGroup={props.handleUpdateGroup}
            handleUpdateGroupMembers={props.handleUpdateGroupMembers}
            handleDialogOpen={props.handleDialogOpen}
            groupToEditMembers={props.groupToEditMembers}
            setGroupToEditMembers={props.setGroupToEditMembers}
            setNotificationPopup={props.setNotificationPopup}
            handleContactMenu={props.handleContactMenu}
            myPresence={props.myPresence}
            myStatuses={props.myStatuses}
          />
        </div>
      )}
      {searchChatDisplay && !props.chatPopoverMode && !props.contact.isBot && (
        <div className={classes.bgcGrey4}>
          <SearchChat
            close={closeSearchChat}
            jumpToMessage={jumpToMessage}
            searchInput={searchInput}
            onChangeSearchInput={onChangeSearchInput}
            contactMessages={contactMessages}
            searchMessageSendingTime={props.searchMessageSendingTime}
          />
        </div>
      )}
    </div>
  );

  return !props.contact ? (
    !props.chatPopoverMode && <div />
  ) : props.contact.contactType === contactTypes.parentGroup ? (
    renderParentGroupMessage()
  ) : !props.contact.chatBox ? (
    <Loader isChat sidebarCollapsed={props.sidebarCollapsed} />
  ) : props.chatPopoverMode ? (
    renderMinimizedChat()
  ) : (
    renderMaximizedChat()
  );
};

Chat.propTypes = {
  contact: PropTypes.object,
  openChat: PropTypes.func,
  goToMap: PropTypes.func,
  sendMessage: PropTypes.func,
  resetChatNumberMessage: PropTypes.func,
  sendGeolocation: PropTypes.func,
  setChatTyping: PropTypes.func,
  contactMap: PropTypes.object,
  handleSelectedContact: PropTypes.func,
  sidebarCollapsed: PropTypes.bool,
  userProfile: PropTypes.object,
  displaySplashPopup: PropTypes.func,
  flyToSpecificAddress: PropTypes.func,
  attachmentPopupDisplay: PropTypes.object,
  setAttachmentPopupDisplay: PropTypes.func,
  offline: PropTypes.bool,
  muteContact: PropTypes.func,
  unmuteContact: PropTypes.func,
  chatNotificationSound: PropTypes.bool,
  isIncomingMessageToneMuted: PropTypes.func,
  handleMutedIncomingMessageTone: PropTypes.func,
  chatPopoverMode: PropTypes.bool,
  maximizeChatPopover: PropTypes.func,
  closeChatPopover: PropTypes.func,
  handleUpdateGroup: PropTypes.func,
  handleUpdateGroupMembers: PropTypes.func,
  handleDialogOpen: PropTypes.func,
  groupToEditMembers: PropTypes.array,
  setGroupToEditMembers: PropTypes.func,
  setNotificationPopup: PropTypes.func,
  handleContactMenu: PropTypes.func,
  tempMessage: PropTypes.object,
  ptvCall: PropTypes.func,
  getLastSeenOfContact: PropTypes.func,
  myPresence: PropTypes.string,
  myStatuses: PropTypes.array,
  localStorageDevices: PropTypes.object,
  addChatBoxToContact: PropTypes.func,
  chatTextAreaValue: PropTypes.string,
  setChatTextAreaValue: PropTypes.func,
  fetchChatHistory: PropTypes.func,
  isFetchingChatTopHistory: PropTypes.bool,
  isFetchingChatBottomHistory: PropTypes.bool,
  scrollToIndex: PropTypes.number,
  setScrollToIndex: PropTypes.func,
  messageAttachments: PropTypes.array,
  handleSetMessageAttachments: PropTypes.func,
  removeAttachment: PropTypes.func,
  removeAllAttachments: PropTypes.func,
  setForwardMessage: PropTypes.func,
  replyMessage: PropTypes.object,
  setReplyMessage: PropTypes.func,
  jumpToMessage: PropTypes.func,
  searchMessageSendingTime: PropTypes.string,
  chatFirstMount: PropTypes.bool,
  setChatFirstMount: PropTypes.func,
  offlineNetworkStatus: PropTypes.bool
};

export default Chat;
