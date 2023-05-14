import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { Menu, MenuItem } from '@mui/material';

import { PRESENCE_STATUSES } from '../../../sdk/src/xmpp/enums';
import messages from './messages';
import { style } from './style';
import { contactTypes } from '../../../sdk/src/contacts/enums';
import AvatarAndPresence from '../../../components/AvatarAndPresence';
import { translateMessage } from '../../../i18n';
import ThreePoints from '../../../components/SVGComponents/threePoints';
import { GlobalContext } from '../../App/context';
import ToolTip from '../../../components/ToolTip';
import { getStaticImages } from '../../App/constants';
import { returnFormattedTime, returnSlashedDate } from '../../../utils/commonFunctions';
import { checkFeaturePermission } from '../../../sdk/src/utils/profileUtils';
import { Capabilities } from '../../../sdk/src/general/enums';
import { TabNames } from '../../HomePage/enums';

const useStyles = makeStyles(style);
const CloseBig = getStaticImages('closeBig.svg');
const Expand = getStaticImages('expand.svg');
const Map = getStaticImages('mapMenu.svg');
// const Search = getStaticImages('search.svg');
const MuteChatNotification = getStaticImages('muteChatNotification.svg');
const Ptv = getStaticImages('ptvMenu.svg');

const UserBar = props => {
  const { getLastSeenOfContact } = props;
  const [threePointsMenu, setThreePointsMenu] = useState({ anchorPosition: null });
  const [lastSeenMessage, setLastSeenMessage] = useState(null);
  const { color, capabilities } = useContext(GlobalContext);

  const classesProps = { chatPopoverMode: props.chatPopoverMode, organizationProfileColor: color };
  const classes = useStyles(classesProps);

  useEffect(() => {
    console.debug('UI.useEffect', 'UserBar', 'props.contact.id', props.contact.id, 'props.contact.presence', props.contact.presence);
    if (PRESENCE_STATUSES.compare(props.contact.presence, PRESENCE_STATUSES.OFFLINE)) {
      const currentDate = new Date();
      getLastSeenOfContact(props.contact.id).then(ls => {
        if (ls.getDate() === currentDate.getDate() - 1) {
          setLastSeenMessage(`${translateMessage({ ...messages.lastSeen })} ${translateMessage({ ...messages.yesterday })}`);
        } else if (ls.getDate() === currentDate.getDate()) {
          setLastSeenMessage(`${translateMessage({ ...messages.lastSeenAt })} ${returnFormattedTime(ls)}`);
        } else {
          setLastSeenMessage(`${translateMessage({ ...messages.lastSeenAt })} ${returnSlashedDate(ls)}`);
        }
      });
    } else {
      setLastSeenMessage(translateMessage({ ...messages.online }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.contact.id, props.contact.presence]);

  const handleContactMenu = event => {
    event.preventDefault();
    event.stopPropagation();
    setThreePointsMenu({ anchorPosition: { x: event.clientX, y: event.clientY } });
  };

  const handleClose = () => {
    setThreePointsMenu({ anchorPosition: null });
  };

  const handleMuteContact = () => {
    if (props.contact.muted) {
      props.unmuteContact(props.contact);
    } else {
      props.muteContact(props.contact);
    }
    handleClose();
  };

  const handleContactDetails = () => {
    props.openContactDetails();
    handleClose();
  };

  const handleMuteIncomingMessageNotificationTone = () => {
    props.handleMutedIncomingMessageTone(props.contact.id);
    handleClose();
  };

  const renderUserMenu = () => (
    <Menu
      open
      anchorReference="anchorPosition"
      anchorPosition={{ top: threePointsMenu.anchorPosition.y, left: threePointsMenu.anchorPosition.x }}
      keepMounted
      onClose={handleClose}
      classes={{ paper: classes.paper }}
      MenuListProps={{ disablePadding: true }}>
      {!props.contact.isBot && (
        <MenuItem classes={{ root: classes.root }} disabled={props.contactDetailsDisplay} onClick={handleContactDetails}>
          {translateMessage({ ...messages.contactDetails })}
        </MenuItem>
      )}
      {props.chatNotificationSound && (
        <MenuItem classes={{ root: classes.root }} onClick={handleMuteIncomingMessageNotificationTone}>
          {props.isIncomingMessageToneMuted()
            ? translateMessage({ ...messages.unmuteChatNotifications })
            : translateMessage({ ...messages.muteChatNotifications })}
        </MenuItem>
      )}
      {!props.contact.isBot && (
        <MenuItem classes={{ root: classes.root }} onClick={() => handleMuteContact()}>
          {props.contact.muted ? translateMessage({ ...messages.unmuteContact }) : translateMessage({ ...messages.muteContact })}
        </MenuItem>
      )}
    </Menu>
  );

  const getMemberNicknames = () => (props.groupMembers ? [...props.groupMembers.values()].map(m => m.nick) : []);

  const contactList = () => getMemberNicknames().join(', ');

  const contactListDiv = () => <div className={classes.contactList}>{contactList()}</div>;

  const contactName = () => <div className={classes.contactName}>{props.contact.nickname}</div>;

  const goToMap = () => props.goToMap(TabNames.MAP);

  return (
    <div className={classes.wrapper}>
      <div className={classes.userDetailsWrapper} onClick={props.openContactDetails}>
        <div>
          <AvatarAndPresence contact={props.contact} presence={props.contact.presence} size={36} whiteBackgroundColor={props.chatPopoverMode} />
        </div>
        <div className={classes.noWrap}>
          <div className={classes.nameAndChatNotification}>
            <ToolTip title={props.contact.nickname}>{contactName()}</ToolTip>
            {props.isIncomingMessageToneMuted() && <img src={MuteChatNotification} alt="" />}
          </div>
          {props.contact.typingStatus ? (
            <div className={classes.typingStatus}>
              {props.contact.contactType === contactTypes.group
                ? props.contact.typingStatus.length > 1
                  ? `${props.contact.typingStatus.join(', ')}${translateMessage({ ...messages.areTyping })}`
                  : `${props.contact.typingStatus}${translateMessage({ ...messages.isTyping })}`
                : translateMessage({ ...messages.typing })}
            </div>
          ) : !props.chatPopoverMode && !props.contact.isBot ? (
            <div className={classes.fs13fw400}>
              {props.contact.contactType === contactTypes.user
                ? lastSeenMessage || translateMessage({ ...messages.clickHere })
                : !props.contactDetailsDisplay && props.contact.members.size > 0 && <ToolTip title={contactList()}>{contactListDiv()}</ToolTip>}
            </div>
          ) : null}
        </div>
      </div>

      <div className={classes.optionsWrapper}>
        {!props.contact.isBot &&
          !props.chatPopoverMode &&
          props.mapCapability &&
          props.contact.contactType === contactTypes.user &&
          props.contact.presence &&
          props.contact.presence.toLowerCase() !== PRESENCE_STATUSES.OFFLINE.toLowerCase() && (
            <img src={Map} alt="" className={classes.option} onClick={goToMap} />
          )}
        {props.chatPopoverMode && (
          <>
            <img src={Expand} alt="" className={classes.option} onClick={props.maximizeChatPopover} />
            <img src={CloseBig} alt="" className={classes.option} onClick={props.closeChatPopover} />
          </>
        )}
        {!window.wideBridgeConfig.sip.disableVideo &&
          !props.chatPopoverMode &&
          !props.contact.isBot &&
          checkFeaturePermission(capabilities, Capabilities.PTV) && (
            <img className={classes.option} src={Ptv} alt="" onClick={() => props.ptvCall(props.contact)} />
          )}
        {/* {!props.chatPopoverMode && !props.contact.isBot && <img className={classes.option} src={Search} alt="" onClick={props.openSearchChat} />} */}
        {!props.chatPopoverMode && (
          <div className={classes.option} onClick={event => handleContactMenu(event)}>
            <ThreePoints isContactPanelMenu />
          </div>
        )}
      </div>
      {threePointsMenu.anchorPosition ? renderUserMenu() : null}
    </div>
  );
};

UserBar.propTypes = {
  contact: PropTypes.object,
  goToMap: PropTypes.func,
  contactDetailsDisplay: PropTypes.bool,
  openContactDetails: PropTypes.func,
  mapCapability: PropTypes.bool,
  muteContact: PropTypes.func,
  unmuteContact: PropTypes.func,
  chatNotificationSound: PropTypes.bool,
  isIncomingMessageToneMuted: PropTypes.func,
  handleMutedIncomingMessageTone: PropTypes.func,
  chatPopoverMode: PropTypes.bool,
  closeChatPopover: PropTypes.func,
  maximizeChatPopover: PropTypes.func,
  // openSearchChat: PropTypes.func,
  ptvCall: PropTypes.func,
  getLastSeenOfContact: PropTypes.func,
  groupMembers: PropTypes.object
};

export default UserBar;
