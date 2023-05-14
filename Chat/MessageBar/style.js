import { COLOR_MAP } from '../../App/constants';

export const style = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
    gap: '16px',
    padding: '10px',
    borderTop: `0.5px solid ${COLOR_MAP.lightGrey}`
  },
  inputWrapper: ({ audioCapturing }) => ({
    backgroundColor: COLOR_MAP.grey4,
    borderRadius: '28px',
    width: audioCapturing ? 'fit-content' : '100%',
    display: 'flex',
    padding: '10px 32px',
    alignItems: 'center',
    position: 'relative',
    cursor: 'text',
    gap: '10px'
  }),
  message: ({ font }) => ({
    width: '100%',
    fontSize: '15px',
    fontWeight: 400,
    backgroundColor: COLOR_MAP.grey4,
    '& textarea': {
      fontFamily: font,
      height: '21px',
      width: 'inherit',
      outline: 'none',
      border: 0,
      padding: 0,
      backgroundColor: COLOR_MAP.grey4,
      resize: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'inherit'
    }
  }),
  attachmentWrapper: {
    width: '22px',
    marginLeft: '5px',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  attachmentCounter: ({ messageCounter, organizationProfileColor }) => ({
    width: '20px',
    height: '20px',
    backgroundColor: organizationProfileColor,
    borderRadius: '20px',
    marginRight: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: COLOR_MAP.white,
    cursor: messageCounter ? 'pointer' : 'cursor',
    fontSize: '15px'
  }),
  // attachmentBoxWrapper: {
  //   border: '1px solid black',
  //   position: 'absolute',
  //   bottom: '50px',
  //   right: '0px',
  //   fontSize: '18px',
  //   backgroundColor: 'wheat',
  //   zIndex: 3,
  //   maxHeight: '200px',
  //   width: '300px',
  //   overflowY: 'auto',
  //   display: 'flex',
  //   flexDirection: 'column'
  // },
  // singleAttachmentWrapper: {
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   margin: '10px'
  // },
  // removeAttachment: {
  //   marginLeft: '10px',
  //   cursor: 'pointer'
  // },
  sendMessage: ({ noAttachmentAndNoMessage, offline }) => ({
    cursor: 'pointer',
    opacity: noAttachmentAndNoMessage || offline ? '0.5' : 1,
    pointerEvents: noAttachmentAndNoMessage || offline ? 'none' : 'auto'
  }),
  // previewWrapper: {
  //   width: '150px',
  //   textAlign: 'center'
  // },
  attachmentName: {
    marginLeft: '30px',
    width: '150px',
    flexFlow: 'nowrap'
  },
  w100: {
    width: '100%'
  },
  textArea: ({ font }) => ({
    fontSize: '15px',
    padding: '10px',
    fontFamily: font
  }),
  paperProps: {
    overflow: 'hidden',
    height: 'fit-content',
    width: '50vw',
    borderRadius: '20px'
  },
  flash: {
    opacity: 1,
    WebkitAnimation: 'flash 0.1s',
    animation: 'flash 0.1s'
  },
  videoErrorWrapper: {
    padding: '46px 150px',
    textAlign: 'center'
  },
  noCamera: {
    width: '80px',
    marginBottom: '8px'
  },
  videoError: {
    fontSize: '15px',
    fontWeight: 700,
    color: COLOR_MAP.greyBlack
  }
};
