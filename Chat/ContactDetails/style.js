import { COLOR_MAP } from '../../App/constants';
import { getLightedColor } from '../../HomePage/utils';

export const style = {
  groupAvatar: {
    width: '120px'
  },
  userAvatar: {
    margin: '0px 7px 0px 0px',
    fontSize: '18px'
  },
  mr4: {
    marginRight: '4px'
  },
  nickname: {
    fontSize: '15px',
    fontWeight: 700,
    color: COLOR_MAP.greyBlack,
    margin: '0px 4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  groupContactWrapper: {
    fontSize: '13px',
    fontWeight: 700,
    color: COLOR_MAP.greyBlack
  },
  mb16: {
    marginBottom: '16px'
  },
  wrapper: {
    height: '100%',
    overflowY: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px 20px',
    height: '60px',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)'
  },
  fs15fw700: {
    fontSize: '15px',
    fontWeight: 700
  },
  fs15fw400mb16: {
    fontSize: '15px',
    fontWeight: 400,
    marginBottom: '16px'
  },
  fs18fw700: {
    fontSize: '18px',
    fontWeight: 700
  },
  pointer: {
    cursor: 'pointer'
  },
  contactList: {
    height: 'calc(100% - 55px)',
    width: '320px',
    overflowY: 'auto'
  },
  m16z0z1620: {
    margin: '16px 0 16px 20px'
  },
  avatar: {
    margin: '16px 0px',
    display: 'flex',
    justifyContent: 'center'
  },
  hr: {
    borderTopWidth: `0px`,
    borderLeftWidth: `0px`,
    borderRightWidth: `0px`,
    borderBottomWidth: `0.5px`,
    borderColor: COLOR_MAP.lightGrey,
    opacity: 0.5
  },
  singleContact: ({ organizationProfileColor, editMode }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    margin: '2px 4px',
    backgroundColor: COLOR_MAP.white,
    height: '70px',
    width: '275px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: editMode ? COLOR_MAP.white : getLightedColor(organizationProfileColor, 0.2)
    }
  }),
  me: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    margin: '2px 4px',
    backgroundColor: COLOR_MAP.white,
    height: '70px',
    width: '275px',
    pointerEvents: 'none'
  },
  addButton: {
    padding: '0px',
    minWidth: '20px',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  singleContactWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 17px 0 12px',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between'
  },
  userAvatarWrapper: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    height: '100%'
  },
  flex: {
    display: 'flex'
  },
  removeContact: {
    cursor: 'pointer',
    margin: '0 0 0 7px',
    pointerEvents: 'auto'
  },
  userNumberWrapper: {
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  edit: {
    cursor: 'pointer',
    margin: '0 20px'
  },
  editGroupName: ({ font }) => ({
    fontFamily: font,
    border: '1px solid #C6C6C6',
    fontSize: '18px',
    fontWeight: 700,
    borderRadius: '4px',
    height: '30px',
    padding: '10px',
    width: '100%'
  }),
  phone: {
    direction: 'initial',
    width: 'fit-content',
    fontSize: '15px',
    fontWeight: 400,
    marginBottom: '16px'
  },
  loading: {
    margin: '16px 0 16px 20px'
  }
};
