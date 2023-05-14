import { COLOR_MAP } from '../../App/constants';

export const style = {
  attachmentBoxWrapper: ({ chatPopoverMode }) => ({
    borderTop: `0.5px solid ${COLOR_MAP.lightGrey}`,
    borderBottom: `0.5px solid ${COLOR_MAP.lightGrey}`,
    backgroundColor: COLOR_MAP.grey4,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: chatPopoverMode ? '150px' : '160px',
    overflowY: 'auto'
  }),
  singleAttachmentWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px'
  },
  removeAttachment: {
    cursor: 'pointer'
  },
  attachmentPreview: {
    margin: '16px 24px 16px 0',
    height: '100px',
    width: '100px',
    borderRadius: '8px',
    backgroundColor: COLOR_MAP.black
  },
  fileDescription: {
    fontSize: '18px',
    fontWeight: '400',
    display: 'flex',
    alignItems: 'baseline'
  },
  fileName: {
    fontWeight: 400,
    fontSize: '15px',
    marginRight: '10px'
  },
  fileSize: {
    fontWeight: 400,
    fontSize: '13px',
    color: COLOR_MAP.darkGrey
  },
  mr8: {
    marginRight: '8px'
  },
  messageSeparator: {
    borderBottom: `0.5px solid ${COLOR_MAP.lightGrey}`,
    margin: '0px 20px'
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fitMedia: {
    height: '100%',
    width: '100%',
    objectFit: 'contain'
  },
  m160: {
    margin: '16px 0px'
  },
  m1624: {
    margin: '16px 24px'
  }
};
