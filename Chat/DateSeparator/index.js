import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

import messages from './messages';
import { style } from './style';
import { GlobalContext } from '../../App/context';
import { returnActivityDate } from '../../../utils/commonFunctions';
import { translateMessage } from '../../../i18n';

const useStyles = makeStyles(style);

const DateSeparator = props => {
  const { language } = useContext(GlobalContext);

  const classes = useStyles();

  /**
   * Return the date of the message or today
   */
  const returnDateSeparator = () =>
    new Date(props.date).toDateString() === new Date().toDateString()
      ? translateMessage({ ...messages.today })
      : returnActivityDate(props.date, language);

  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        <div className={classes.border} />
        <span className={classes.content}>{returnDateSeparator()}</span>
        <div className={classes.border} />
      </div>
    </div>
  );
};

DateSeparator.propTypes = {
  date: PropTypes.string
};

export default DateSeparator;
