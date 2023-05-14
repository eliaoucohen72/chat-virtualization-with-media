import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Popover from '@mui/material/Popover';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';

import Splash from '../../../components/SVGComponents/splash';
import { style } from './style';
import messages from './messages';
import File from '../../../components/SVGComponents/file';
import Gallery from '../../../components/SVGComponents/gallery';
import { GlobalContext } from '../../App/context';
import { checkFeaturePermission } from '../../../sdk/src/utils/profileUtils';
import { Capabilities } from '../../../sdk/src/general/enums';
import Camera from '../../../components/SVGComponents/camera';
import VoiceRecord from '../../../components/SVGComponents/voiceRecord';
import { translateMessage } from '../../../i18n';
import { getInputMediaUploadAcceptedFiles, getInputUploadAcceptedFiles } from '../../../sdk/src/utils/commonFunctions';

const useStyles = makeStyles(style);
const CustomPopover = withStyles(style.popover)(Popover);

const AttachmentPopup = props => {
  const { color, capabilities } = useContext(GlobalContext);
  const classesProps = { color };
  const classes = useStyles(classesProps);

  /**
   * Close the popup
   */
  const handleClose = () => {
    props.close();
  };

  /**
   * Return the selected files
   *
   * @param  {object} event - Files
   */
  const uploadFile = event => {
    props.uploadFile([...event.target.files]);
    props.close();
  };

  const record = () => {
    props.record();
    props.close();
  };

  const openCameraDialog = () => {
    props.openCameraDialog('video');
    props.close();
  };

  const displaySplashPopup = () => {
    props.displaySplashPopup({ tts: false, sound: false });
    props.close();
  };

  return (
    <CustomPopover
      open={!!props.open}
      anchorEl={props.open}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: props.position.y - 140, left: props.position.x - 150 }}>
      <>
        <div className={classes.element}>
          <label className={classes.icon}>
            <input type="file" accept={getInputUploadAcceptedFiles()} multiple hidden onChange={uploadFile} />
            <File />
          </label>
          <div className={classes.label}>{translateMessage({ ...messages.files })}</div>
        </div>
        <div className={classes.element}>
          <label className={classes.icon}>
            <input type="file" accept={getInputMediaUploadAcceptedFiles()} multiple hidden onChange={uploadFile} />
            <Gallery />
          </label>
          <div className={classes.label}>{translateMessage({ ...messages.gallery })}</div>
        </div>
        <div className={classes.element}>
          <div className={classes.icon} onClick={openCameraDialog}>
            <Camera />
          </div>
          <div className={classes.label}>{translateMessage({ ...messages.camera })}</div>
        </div>
        {checkFeaturePermission(capabilities, Capabilities.SPLASH_MESSAGE) && (
          <div className={classes.element}>
            <div className={classes.icon} onClick={displaySplashPopup}>
              <Splash />
            </div>
            <div className={classes.label}>{translateMessage({ ...messages.splashMessage })}</div>
          </div>
        )}
        <div className={classes.element}>
          <div className={classes.icon} onClick={record}>
            <VoiceRecord />
          </div>
          <div className={classes.label}>{translateMessage({ ...messages.voiceRecording })}</div>
        </div>
      </>
    </CustomPopover>
  );
};

AttachmentPopup.propTypes = {
  open: PropTypes.object,
  close: PropTypes.func,
  position: PropTypes.object,
  uploadFile: PropTypes.func,
  displaySplashPopup: PropTypes.func,
  record: PropTypes.func,
  openCameraDialog: PropTypes.func
};

export default AttachmentPopup;
