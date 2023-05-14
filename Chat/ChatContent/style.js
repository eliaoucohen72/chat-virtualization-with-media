import { COLOR_MAP } from '../../App/constants';
import { MESSAGE_BAR_HEIGHT, USER_BAR_HEIGHT } from '../constants';

export const style = {
  noContent: ({ isBot }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: `calc(100% - ${USER_BAR_HEIGHT} - ${isBot ? '0px' : MESSAGE_BAR_HEIGHT})`
  }),
  messageWrapper: ({ isBot }) => ({
    position: 'relative',
    height: `calc(100% - ${USER_BAR_HEIGHT} - ${isBot ? '0px' : MESSAGE_BAR_HEIGHT})`
  }),
  activityCallLogWrapper: {
    clear: 'both',
    padding: '20px 0px'
  },
  affiliationLogWrapper: {
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontWeight: 400,
    clear: 'both'
  },
  activityTime: {
    fontSize: '13px',
    fontWeight: 400,
    color: COLOR_MAP.darkGrey,
    textAlign: 'center'
  },
  flexRowCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  s15w600: {
    fontSize: '15px',
    fontWeight: 600
  },
  s15w400grey: {
    fontSize: '15px',
    fontWeight: 400,
    color: COLOR_MAP.darkGrey
  },
  padding020: {
    padding: '0 20px'
  },
  loadingTop: {
    zIndex: 1,
    position: 'absolute',
    padding: 12,
    gap: 8,
    backgroundColor: COLOR_MAP.white,
    fontSize: 15,
    fontWeight: 700,
    top: 30,
    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    left: '50%',
    transform: 'translate(-50%, 0%)'
  },
  loadingBottom: {
    zIndex: 1,
    position: 'absolute',
    padding: 12,
    gap: 8,
    backgroundColor: COLOR_MAP.white,
    fontSize: 15,
    fontWeight: 700,
    bottom: 30,
    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    left: '50%',
    transform: 'translate(-50%, 0%)'
  }
};
