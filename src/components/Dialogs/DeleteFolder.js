// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, FormControlLabel, Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

const styles = {
  
};

class DeleteFolder extends PureComponent {

  state = {
    loading: false,
    clear: false,
    taskMessage: '',
    taskID: null,
  }

  handleDelete = () => {
    const { id, onSuccess, onError, domainID } = this.props;
    const { clear } = this.state;
    this.setState({ loading: true });
    this.props.delete(domainID, id, { clear })
      .then(response => {
        if(response?.taskID) {
          this.setState({
            taskMessage: response.message || 'Task created',
            loading: false,
            taskID: response.taskID,
          });
        } else {
          onSuccess();
          this.setState({ loading: false, clear: false });
        }
      })
      .catch(error => {
        if(onError) onError(error);
        this.setState({ loading: false, clear: false });
      });
  }

  handleCheckbox = e => this.setState({ clear: e.target.checked })

  handleViewTask = () => {
    this.props.history.push('/taskq/' + this.state.taskID);
  }

  handleClose = () => {
    this.setState({ taskMessage: '', taskID: null });
    this.props.onClose();
  }

  render() {
    const { t, open, item, onClose } = this.props;
    const { loading, clear, taskMessage, taskID } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{taskMessage ? taskMessage : `Are you sure you want to delete ${item}?`}</DialogTitle>
        <DialogContent>
          {!taskMessage && <FormControlLabel
            control={<Checkbox onChange={this.handleCheckbox} value={clear} />}
            label={t('Clear folder data')}
          />}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.handleClose}
            color="secondary"
          >
            {t(taskMessage ? 'Close' : 'Cancel')}
          </Button>
          {!taskMessage && <Button
            onClick={this.handleDelete}
            variant="contained"
            color="secondary"
          >
            {loading ? <CircularProgress size={24}/> : t('Confirm')}
          </Button>}
          {taskMessage && taskID > 0 && <Button variant="contained" onClick={this.handleViewTask}>
            {t('View task')}
          </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

DeleteFolder.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.string,
  domainID: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withTranslation()(withStyles(styles)(DeleteFolder)));
