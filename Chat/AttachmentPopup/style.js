import { getLightedColor } from '../../HomePage/utils';

export const style = {
  popover: {
    paper: { borderRadius: '20px', display: 'flex', justifyContent: 'center', gap: '16px', padding: '20px' }
  },
  element: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '60px',
    textAlign: 'center',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  label: {
    fontSize: '15px',
    fontWeight: '400',
    marginTop: '4px'
  },
  icon: ({ color }) => ({
    width: '36px',
    height: '36px',
    border: '1px solid #C6C6C6',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: getLightedColor(color, 0.2)
    }
  })
};
