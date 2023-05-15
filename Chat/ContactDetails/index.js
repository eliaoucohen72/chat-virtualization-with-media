import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { Button } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import messages from './messages';
import { style } from './style';
import { contactTypes } from '../../../sdk/src/contacts/enums';
import AvatarAndPresence from '../../../components/AvatarAndPresence';
import Role from '../../../components/SVGComponents/role';
import { isBot, isIncidentReporter, parsePhoneNumber, sortByStringInObjectArray } from '../../HomePage/utils';
import AddButton from '../../../components/SVGComponents/addButton';
import { NOTIFICATION_POPUP_TYPE, panelTypes, popupModes } from '../../HomePage/enums';
import { extractContactNameFromJID } from '../../../utils/stringManipulation';
import { translateMessage } from '../../../i18n';
import { GlobalContext } from '../../App/context';
import ToolTip from '../../../components/ToolTip';
import Loading from '../../../components/SVGComponents/loading';
import { getStaticImages } from '../../App/constants';
import { id2Jid } from '../../../sdk/src/contacts/contacts';
import { isItMyself } from '../../../utils/commonFunctions';
import Input from '../../../components/CommonComponents/Input/input';

const useStyles = makeStyles(style);
const Close = getStaticImages('closeSmall.svg');
const Edit = getStaticImages('edit.svg');
const SaveEdit = getStaticImages('saveEdit.svg');
const Admin = getStaticImages('admin.svg');

function ContactDetails(props) {
  const { handleSelectedContact, closeContactDetails, groupToEditMembers, setGroupToEditMembers } = props;
  const { color, font } = useContext(GlobalContext);
  const [editMode, setEditMode] = useState(false);
  const [groupName, setGroupName] = useState(props.contact.nickname);
  const [hovered, setHovered] = useState(false);
  const [updateGroupNameLoading, setUpdateGroupNameLoading] = useState(false);

  const classes = useStyles({ organizationProfileColor: color, editMode, font });

  const closeDetails = useCallback(() => {
    setGroupToEditMembers([]);
    if (!editMode) {
      closeContactDetails();
    } else {
      setEditMode(false);
    }
  }, [closeContactDetails, editMode, setGroupToEditMembers]);

  const goToSelectedContact = useCallback(
    contact => {
      handleSelectedContact(contact);
      closeDetails();
    },
    [closeDetails, handleSelectedContact]
  );

  useEffect(() => {
    setGroupName(props.contact.nickname);
  }, [props.contact.nickname]);

  const amIAdminMember = () => props.groupMembers && props.groupMembers.size > 0 && props.groupMembers.get(id2Jid(props.userProfile.id)).isAdmin;

  const removeContactFromGroup = contact => {
    const contacts = groupToEditMembers.filter(c => c.id !== contact.id);
    setGroupToEditMembers(contacts);
  };

  const addContactsGroup = () => {
    props.handleDialogOpen(popupModes.editGroup);
  };

  const handleClick = (event, contact) => {
    if (!isItMyself(contact.id, props.userProfile.id) && !contact.notInMyRoster && !editMode) {
      goToSelectedContact(contact);
    }
  };

  const handleContactMenu = (event, contact) => {
    event.preventDefault();
    event.stopPropagation();
    if (isItMyself(contact.id, props.userProfile.id) || (contact.notInMyRoster && (!editMode || !amIAdminMember()))) {
      return;
    }
    props.handleContactMenu(contact, event.clientX, event.clientY, panelTypes.contact_details, amIAdminMember(), editMode);
  };

  const contactName = contact => <div className={classes.nickname}>{contact.nickname || contact.displayName}</div>;

  const renderSingleContact = contact => (
    <div
      key={contact.id}
      onContextMenu={event => handleContactMenu(event, contact)}
      onClick={event => handleClick(event, contact)}
      className={
        !isItMyself(contact.id, props.userProfile.id) && !isBot(contact.nickname) && !isIncidentReporter(contact.id)
          ? classes.singleContact
          : classes.me
      }>
      <div className={classes.singleContactWrapper}>
        <div className={classes.userAvatarWrapper}>
          <div className={classes.userAvatar}>
            <AvatarAndPresence
              whiteBackgroundColor
              contact={isItMyself(contact.id, props.userProfile.id) ? { ...contact, statuses: props.myStatuses } : contact}
              presence={isItMyself(contact.id, props.userProfile.id) ? props.myPresence : contact.presence}
              size={46}
            />
          </div>
          <div>{contact.role && <Role color={contact.color} />}</div>
          <ToolTip title={contact.nickname || contact.displayName}>{contactName(contact)}</ToolTip>
        </div>

        <div className={classes.flex}>
          {contact.isAdmin && (
            <ToolTip title={translateMessage({ ...messages.admin })}>
              <img src={Admin} alt="" />
            </ToolTip>
          )}
          {editMode && extractContactNameFromJID(contact.id) !== props.userProfile.id && (
            <img className={classes.removeContact} onClick={() => removeContactFromGroup(contact)} src={Close} alt="" />
          )}
        </div>
      </div>
    </div>
  );

  const returnSortedList = () => {
    const sortedByNick = sortByStringInObjectArray([...props.groupMembers.values()], 'nick');

    const sortedByAffiliation = sortedByNick.sort(e => e.isAdmin);

    const sortedList = sortedByAffiliation.map(c =>
      isIncidentReporter(c.jid) || isBot(c.nick)
        ? {
            id: c.jid,
            nickname: c.nick,
            phone: null,
            notInMyRoster: false,
            isAdmin: false
          }
        : props.contactMap.has(c.jid)
        ? { ...props.contactMap.get(c.jid), isAdmin: c.isAdmin }
        : {
            id: c.jid,
            nickname: c.nick,
            phone: c.jid.split('_')[0],
            notInMyRoster: true,
            isAdmin: c.isAdmin
          }
    );

    return sortedList;
  };

  const renderGroupMemberList = () => {
    const list = editMode ? groupToEditMembers : returnSortedList();
    return list.map(contact => renderSingleContact(contact));
  };

  const renderGroupContacts = () => (
    <div className={classes.groupContactWrapper}>
      <div className={classes.userNumberWrapper}>
        <div className={classes.fs15fw700}>{`${renderGroupMemberList().length}${translateMessage({ ...messages.users })}`}</div>
        {editMode && (
          <div onClick={addContactsGroup} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Button disableRipple className={classes.addButton}>
              <AddButton width={20} height={20} hovered={hovered} />
            </Button>
          </div>
        )}
      </div>
      {renderGroupMemberList()}
    </div>
  );

  const handleUpdateGroup = async () => {
    // Update group members
    if (!isEqual([...props.groupMembers.values()].map(e => e.jid).sort(), groupToEditMembers.map(e => e.id).sort())) {
      console.debug('ContactDetails members changed');
      const response = await props.handleUpdateGroupMembers(props.contact.id, groupToEditMembers);
      if (!isEmpty(response)) {
        props.setNotificationPopup({
          type: NOTIFICATION_POPUP_TYPE.ALERT,
          title: translateMessage({ ...messages.error }),
          message: response.error
        });
      }
    }

    // Update group name - The loading indication for then group members update is the size of the group member, look at the condition props.groupMembers.size === 0, see below
    if (props.contact.nickname !== groupName) {
      console.debug('ContactDetails name changed');
      setUpdateGroupNameLoading(true);
      const response = await props.handleUpdateGroup(props.contact.id, groupName);
      setUpdateGroupNameLoading(false);
      if (!response.GroupId) {
        setGroupName(props.contact.nickname);
        props.setNotificationPopup({ type: NOTIFICATION_POPUP_TYPE.ALERT, title: translateMessage({ ...messages.error }), message: response.error });
      } else {
        setGroupName(groupName);
      }
    }

    setEditMode(false);
  };

  const activeEditMode = () => {
    setGroupToEditMembers(returnSortedList());
    setEditMode(true);
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <div className={classes.fs15fw700}>{translateMessage({ ...messages.contactDetails })}</div>
        <div>
          {props.contact.contactType === contactTypes.group ? (
            editMode ? (
              <img className={classes.edit} onClick={handleUpdateGroup} src={SaveEdit} alt="" />
            ) : (
              amIAdminMember() && (
                <ToolTip title={translateMessage({ ...messages.editGroup })}>
                  <img className={classes.edit} onClick={activeEditMode} src={Edit} alt="" />
                </ToolTip>
              )
            )
          ) : null}
          <img className={classes.pointer} onClick={closeDetails} src={Close} alt="" />
        </div>
      </div>
      {/* {console.log('ContactDetails props.groupMembers ', props.groupMembers.size)} */}
      {updateGroupNameLoading || (props.contact.contactType === contactTypes.group && props.groupMembers.size === 0) ? (
        <div className={classes.contactList}>
          <div className={classes.m16z0z1620}>
            <div className={classes.avatar}>
              <AvatarAndPresence contact={props.contact} presence={props.contact.presence} size={120} noDisplayPresence />
            </div>
            <div style={{ margin: '16px' }}>
              <Loading />
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.contactList}>
          <div className={classes.m16z0z1620}>
            <div className={classes.avatar}>
              <AvatarAndPresence contact={props.contact} presence={props.contact.presence} size={120} noDisplayPresence />
            </div>
            {editMode ? <Input value={groupName} onChange={setGroupName} /> : <div className={classes.fs18fw700}>{groupName}</div>}
          </div>

          {/* Department and role */}
          {(props.contact.department || props.contact.role) && (
            <>
              <hr className={classes.hr} />
              <div className={classes.m16z0z1620}>
                {props.contact.department && (
                  <>
                    <div className={classes.fs15fw700}>{translateMessage({ ...messages.department })}</div>
                    <div className={classes.fs15fw400mb16}>{props.contact.department}</div>
                  </>
                )}
                {props.contact.role && (
                  <>
                    <div className={classes.fs15fw700}>{translateMessage({ ...messages.role })}</div>
                    <div className={classes.fs15fw400mb16}>{props.contact.role}</div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Short code and phone number */}
          {(props.contact.shortCode || props.contact.phone) && (
            <>
              <hr className={classes.hr} />
              <div className={classes.m16z0z1620}>
                {props.contact.shortCode && (
                  <>
                    <div className={classes.fs15fw700}>{translateMessage({ ...messages.shortCode })}</div>
                    <div className={classes.fs15fw400mb16}>{props.contact.shortCode}</div>
                  </>
                )}
                {props.contact.phone && (
                  <>
                    <div className={classes.fs15fw700}>{translateMessage({ ...messages.phoneNumber })}</div>
                    <div className={classes.phone}>{parsePhoneNumber(props.contact.phone)}</div>
                  </>
                )}
              </div>
            </>
          )}
          <hr className={classes.hr} />
          {props.contact.contactType === contactTypes.group && <div className={classes.m16z0z1620}>{renderGroupContacts()}</div>}
        </div>
      )}
    </div>
  );
}

ContactDetails.propTypes = {
  contact: PropTypes.object,
  closeContactDetails: PropTypes.func,
  contactMap: PropTypes.object,
  handleSelectedContact: PropTypes.func,
  userProfile: PropTypes.object,
  handleUpdateGroup: PropTypes.func,
  handleUpdateGroupMembers: PropTypes.func,
  handleDialogOpen: PropTypes.func,
  groupToEditMembers: PropTypes.array,
  setGroupToEditMembers: PropTypes.func,
  setNotificationPopup: PropTypes.func,
  handleContactMenu: PropTypes.func,
  myPresence: PropTypes.string,
  myStatuses: PropTypes.array,
  groupMembers: PropTypes.object
};

export default ContactDetails;
