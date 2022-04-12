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
    return (
      <Portal>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={!!snackbar}
          onClose={onClose}
          autoHideDuration={(snackbar || '').includes('Success!') ? 2000 : 6000}
          transitionDuration={{ in: 0, appear: 250, enter: 250, exit: 0 }}
        >
          <Alert
            onClose={onClose}
            severity={(snackbar || '').toLowerCase().includes('success') ? "success" : "error"}
            elevation={6}
            variant="filled"
          >
            {(snackbar || '') === "The server encountered an error while processing the request." && config.devMode ?
              <img src={PANIK} alt="PANIK" height="80" width="78"/>:
              (snackbar || '')}
            
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
