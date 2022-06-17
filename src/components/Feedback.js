// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import { Portal, Snackbar } from '@mui/material';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import Alert from '@mui/lab/Alert';
import PANIK from '../res/panik.png';
import { config } from '../config';

class Feedback extends PureComponent {
  
  render() {
    const { snackbar, onClose } = this.props;
    const msg = (snackbar || '').toString();
    return (
      <Portal>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={!!snackbar}
          onClose={onClose}
          autoHideDuration={(msg || '').includes('Success!') ? 2000 : 6000}
          transitionDuration={{ in: 0, appear: 250, enter: 250, exit: 0 }}
        >
          <Alert
            onClose={onClose}
            severity={(msg || '').includes('Success!') ? "success" : "error"}
            elevation={6}
            variant="filled"
          >
            {(msg || '') === "The server encountered an error while processing the request." && config.devMode ?
              <img src={PANIK} alt="PANIK" height="80" width="78"/>:
              (msg || '')}
            
          </Alert>
        </Snackbar>
      </Portal>
    );
  }
}

Feedback.propTypes = {
  snackbar: PropTypes.string,
  onClose: PropTypes.func,
};

export default Feedback;
