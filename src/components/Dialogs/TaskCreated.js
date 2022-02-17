// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

const styles = {
};

class TaskCreated extends PureComponent {

  state = {
    loading: false,
    force: false,
  }

  handleChange = event => {
    this.setState({ force: event.target.checked });
  };

  handleViewTask = () => {
    this.props.history.push('/taskq/' + this.props.taskID);
  }

  render() {
    const { t, message, taskID, onClose } = this.props;

    return (
      <Dialog
        onClose={onClose}
        open={!!message}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{message}</DialogTitle>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Close')}
          </Button>
          {message && taskID > 0 && <Button variant="contained" onClick={this.handleViewTask}>
            {t('View task')}
          </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

TaskCreated.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  message: PropTypes.string,
  taskID: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withTranslation()(withStyles(styles)(TaskCreated)));
