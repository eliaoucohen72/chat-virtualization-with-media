import { COLOR_MAP } from '../App/constants';
import { COLLAPSED_SIDEBAR_WIDTH } from './constants';

export const style = {
  wrapper: ({ sidebarCollapsed }) => ({
    width: sidebarCollapsed ? `calc(100% - ${COLLAPSED_SIDEBAR_WIDTH}px)` : `calc(100% - ${COLLAPSED_SIDEBAR_WIDTH}px)`
  }),
  subWrapper: ({ isAttachmentBox, attachmentBoxHeight }) => ({
    width: '100%',
    height: !isAttachmentBox ? '100%' : `calc(100% - ${attachmentBoxHeight}px)`
  }),
  bgcGrey4: {
    backgroundColor: COLOR_MAP.grey4,
    borderLeft: '1px solid #C6C6C6'
  },
  w100p: {
    width: '100%'
  },
  dialog: {
    height: 'fit-content',
    width: 'fit-content'
  },
  parentGroupMessage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
