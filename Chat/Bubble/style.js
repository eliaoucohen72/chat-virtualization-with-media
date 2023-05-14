import { COLOR_MAP } from '../../App/constants';
import { getLightedColor, isDefaultFlavor } from '../../HomePage/utils';
import { MEDIA_BUBBLE_MAX_HEIGHT, MEDIA_BUBBLE_MAX_WIDTH } from '../constants';

export const style = {
  wrapper: ({ isIncoming, isFirst, organizationProfileColor, isTheSameSender, borderRadius, isAudio }) => ({
    backgroundColor: !isIncoming ? getLightedColor(organizationProfileColor, 0.3) : COLOR_MAP.middleGrey,
    float: isIncoming ? 'left' : 'right',
    clear: 'both',
    borderRadius,
    width: isAudio ? `${MEDIA_BUBBLE_MAX_WIDTH + 20 /* padding */}px` : undefined,
    maxWidth: `${MEDIA_BUBBLE_MAX_WIDTH + 20 /* padding */}px`,
    padding: '10px',
    margin: !isTheSameSender && !isFirst ? '3px 0' : '2px 0',
    position: 'relative',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.15)',
    whiteSpace: 'break-spaces'
  }),
  lastMessageMarginBottom: {
    clear: 'both',
    width: '100%',
    height: '64px'
  },
  name: {
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px'
  },
  geoLocMessage: ({ organizationProfileColor }) => ({
    fontSize: '15px',
    fontWeight: 700,
    maxWidth: 'auto',
    marginTop: '0px',
    color: organizationProfileColor,
    cursor: 'pointer',
    display: 'inline' // To available the click only on the text
  }),
  timeWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px'
  },
  time: {
    marginRight: '10px',
    fontSize: '13px',
    fontWeight: '400'
  },
  mediaAttachment: {
    maxHeight: `${MEDIA_BUBBLE_MAX_HEIGHT}px`,
    maxWidth: `${MEDIA_BUBBLE_MAX_WIDTH}px`,
    cursor: 'pointer',
    borderRadius: '10px',
    objectFit: 'contain'
  },
  otherAttachment: ({ isIncoming, organizationProfileColor }) => ({
    width: '100%',
    border: isIncoming ? '1px solid black' : `1px solid ${organizationProfileColor}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '8px'
  }),
  pointer: { cursor: 'pointer' },
  mr10: {
    marginRight: '10px'
  },
  readMore: ({ organizationProfileColor }) => ({
    fontSize: '15px',
    fontWeight: 700,
    color: isDefaultFlavor() ? COLOR_MAP.defaultFillingColor : organizationProfileColor
  }),
  fs40BcRed: {
    fontSize: '40px',
    backgroundColor: 'red'
  },
  videoPreviewWrapper: {
    position: 'relative',
    cursor: 'pointer'
  },
  play: {
    width: '30%',
    position: 'absolute',
    left: '0',
    right: '0',
    top: '0',
    bottom: '0',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    cursor: 'pointer'
  },
  inline: {
    display: 'inline'
  },
  greyBlack: {
    color: COLOR_MAP.greyBlack
  },
  searchedTerm: ({ organizationProfileColor }) => ({
    fontWeight: 700,
    color: organizationProfileColor
  }),
  threePoints: ({ isIncoming }) => ({
    position: 'absolute',
    borderRadius: '50px',
    backgroundColor: COLOR_MAP.middleGrey,
    display: 'flex',
    cursor: 'pointer',
    left: isIncoming ? 'unset' : '-40px',
    right: isIncoming ? '-40px' : 'unset',
    top: '40%'
  }),
  paper: {
    backgroundColor: COLOR_MAP.grey4,
    borderRadius: '12px',
    width: '180px'
  },
  root: ({ organizationProfileColor }) => ({
    display: 'flex',
    gap: '4px',
    fontSize: '15px',
    padding: '12px',
    alignItems: 'center',
    '&:hover': {
      background: getLightedColor(organizationProfileColor, 0.3)
    }
  })
};
