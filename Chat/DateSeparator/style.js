import { COLOR_MAP } from '../../App/constants';

export const style = {
  wrapper: {
    fontWeight: 600,
    fontSize: '15px',
    clear: 'both',
    padding: '8px 0px'
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  border: {
    borderBottom: `1px solid ${COLOR_MAP.lightGrey}`,
    opacity: 0.5,
    width: '100%'
  },
  content: {
    padding: '0 10px 0 10px',
    whiteSpace: 'nowrap'
  }
};
