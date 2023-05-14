import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

import messages from './messages';
import { style } from './style';
import { translateMessage } from '../../../i18n';
// eslint-disable-next-line import/named
import { getStaticImages } from '../../App/constants';
import { GlobalContext } from '../../App/context';
import { returnRecentTime } from '../../../utils/commonFunctions';
import { ACTIVITY_TYPES } from '../../../sdk/src/general/enums';
import SearchBar from '../../../components/SearchBar';

const useStyles = makeStyles(style);
const Close = getStaticImages('closeSmall.svg');

function SearchChat({ close, jumpToMessage, searchInput, onChangeSearchInput, contactMessages }) {
  const { color, font } = useContext(GlobalContext);
  const classes = useStyles({ organizationProfileColor: color, font });

  const renderedBody = body => {
    const searchIndex = body.toLowerCase().indexOf(searchInput.toLocaleLowerCase());
    const beforeSearchTerm = body.substring(0, searchIndex);
    const searchTerm = body.substring(searchIndex, searchIndex + searchInput.length);
    const afterSearchTerm = body.substring(searchIndex + searchInput.length);

    return (
      <div className={classes.inline}>
        <span className={classes.greyBlack}>{beforeSearchTerm}</span>
        <span className={classes.searchedTerm}>{searchTerm}</span>
        <span className={classes.greyBlack}>{afterSearchTerm}</span>
      </div>
    );
  };

  const renderedMessages = () =>
    contactMessages
      .filter(
        m => (!m.activityType || m.activityType === ACTIVITY_TYPES.CHAT) && m.body && m.body.toLowerCase().search(searchInput.toLowerCase()) > -1
      )
      .map((m, index) => (
        <div key={m.id} className={classes.messageWrapper} onClick={() => jumpToMessage(m, index)}>
          <div className={classes.time}>{returnRecentTime(m.sendingDate || m.receivedDate)}</div>
          <span className={classes.fs15fw700}>{m.sender === 'me' ? translateMessage({ ...messages.you }) : `${m.getRealNickname()}: `}</span>
          <span className={classes.fs15}>{renderedBody(m.body)}</span>
        </div>
      ));

  const onChangeInput = value => onChangeSearchInput(value);
  const clearInput = () => onChangeSearchInput('');

  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <div className={classes.fs15fw700}>{translateMessage({ ...messages.searchChat })}</div>
        <div>
          <img className={classes.pointer} onClick={close} src={Close} alt="" />
        </div>
      </div>
      <div className={classes.searchWrapper}>
        <SearchBar input={searchInput} clearInput={clearInput} onChangeInput={onChangeInput} />
      </div>
      <hr className={classes.hr} />
      {searchInput === '' ? (
        <div className={classes.m1630}>{translateMessage({ ...messages.searchMessages })}</div>
      ) : searchInput !== '' && renderedMessages().length === 0 ? (
        <div className={classes.m1630}>{translateMessage({ ...messages.noMessageFound })}</div>
      ) : (
        <div className={classes.listWrapper}>{renderedMessages()}</div>
      )}
    </div>
  );
}

SearchChat.propTypes = {
  close: PropTypes.func,
  jumpToMessage: PropTypes.func,
  searchInput: PropTypes.string,
  onChangeSearchInput: PropTypes.func,
  contactMessages: PropTypes.array
};

export default SearchChat;
