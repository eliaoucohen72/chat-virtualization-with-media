import { COLOR_MAP } from '../../App/constants';
import { getLightedColor } from '../../HomePage/utils';
import { MEDIA_BUBBLE_MAX_WIDTH } from '../constants';

export const style = {
  wrapper: ({ isIncoming, isFirst, organizationProfileColor, isTheSameSender, borderRadius, isLastMessage, chatPopoverMode }) => ({
    backgroundColor: !isIncoming ? getLightedColor(organizationProfileColor, 0.3) : COLOR_MAP.middleGrey,
    float: isIncoming ? 'left' : 'right',
    clear: 'both',
    borderRadius,
    width: chatPopoverMode ? '60%' : `${MEDIA_BUBBLE_MAX_WIDTH + 20 /* padding */}px`,
    padding: '10px',
    marginTop: !isTheSameSender && !isFirst ? '6px' : '4px',
    marginBottom: isLastMessage ? 64 : 0,
    position: 'relative',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.15)',
    whiteSpace: 'break-spaces'
  }),
  soundAttachment: {
    width: '100%',
    display: 'none'
  },
  timeline: {
    backgroundColor: getLightedColor('#071F35', 0.6),
    height: '3px',
    width: '100%'
  },
  thumb: ({ color, thumbRefLeft }) => ({
    backgroundColor: color,
    width: '10px',
    height: '10px',
    borderRadius: '10px',
    position: 'absolute',
    bottom: '22px',
    left: `${thumbRefLeft}px`,
    zIndex: 1
  }),
  button: {
    cursor: 'pointer',
    zIndex: 2
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: '15px'
  },
  back: {
    display: 'flex',
    justifyContent: 'end',
    cursor: 'pointer'
  },
  sendingDate: {
    display: 'flex',
    justifyContent: 'end',
    fontSize: '13px',
    fontWeight: '400'
  },
  footerWrapper: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  footer: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  elapsedTime: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '400'
  },
  pttNumber: {
    color: COLOR_MAP.grey
  }
};
