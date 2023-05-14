import { COLOR_MAP } from '../../App/constants';
import { getLightedColor } from '../../HomePage/utils';

export const style = {
  wrapper: ({ chatPopoverMode }) => ({
    backgroundColor: chatPopoverMode ? COLOR_MAP.white : COLOR_MAP.grey4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
    padding: '8px 16px 8px 16px',
    cursor: chatPopoverMode ? 'default' : 'pointer',
    zIndex: 1,
    position: 'relative'
  }),
  userDetailsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '-webkit-fill-available'
  },
  userImageProfile: {
    width: '32px',
    height: '32px',
    margin: '3px 11px 3px 3px'
  },
  s15w700: { fontWeight: 700, fontSize: '15px' },
  optionsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  option: {
    cursor: 'pointer'
  },
  resizeIcon: {
    cursor: 'pointer',
    marginRight: '0px'
  },
  nameInAvatar: {
    fontSize: '17px',
    fontWeight: 600
  },
  pictureInAvatar: {
    width: '100%'
  },
  close: {
    marginRight: '8px',
    cursor: 'pointer'
  },
  ml19: {
    marginLeft: '9px'
  },
  fs13fw400: {
    fontSize: '13px',
    fontWeight: 400
  },
  typingStatus: {
    fontSize: '13px',
    fontWeight: '400',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '500px'
  },
  contactList: {
    textOverflow: 'ellipsis',
    maxWidth: '324px',
    overflowX: 'hidden'
  },
  paper: {
    backgroundColor: COLOR_MAP.grey4,
    borderRadius: '12px',
    width: '200px'
  },
  root: ({ organizationProfileColor }) => ({
    fontSize: '15px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      background: getLightedColor(organizationProfileColor, 0.3)
    }
  }),
  contactName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '324px',
    fontWeight: 700,
    fontSize: '15px'
  },
  noWrap: {
    whiteSpace: 'nowrap'
  },
  nameAndChatNotification: {
    display: 'flex',
    gap: '9px'
  }
};
