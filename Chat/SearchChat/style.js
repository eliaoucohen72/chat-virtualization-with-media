import { COLOR_MAP } from '../../App/constants';

export const style = {
  wrapper: {
    height: '100%',
    overflowY: 'hidden',
    width: '270px'
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
  pointer: {
    cursor: 'pointer'
  },
  searchWrapper: { position: 'relative', margin: '16px 20px' },
  hr: { borderTop: `0.5px solid ${COLOR_MAP.lightGrey}` },
  listWrapper: {
    margin: '16px 9px',
    overflowY: 'auto',
    height: 'calc(100% - 145px)'
  },
  messageWrapper: {
    backgroundColor: COLOR_MAP.white,
    padding: '10px 16px',
    boxShadow: '0px 2px 6px rgb(0 0 0 / 20%)',
    borderRadius: '8px',
    margin: '4px 0px',
    cursor: 'pointer'
  },
  time: {
    display: 'flex',
    justifyContent: 'end',
    color: COLOR_MAP.greyBlack
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
  fs15: {
    fontSize: '15px'
  },
  m1630: {
    margin: '16px 30px'
  }
};
