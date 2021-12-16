// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, FormControlLabel, Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';

const styles = {
  
};

class DeleteFolder extends PureComponent {

  state = {
    loading: false,
    clear: false,
    taskMessage: '',
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

  getStateFromId(id) {
    switch(id) {
      case 0: return 'Queued';
      case 1: return 'Loaded';
      case 2: return 'Running';
      case 3: return 'Completed';
      case 4: return 'Error';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  render() {
    const { t, open, item, onClose } = this.props;
    const { loading, clear, taskMessage } = this.state;

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
            onClick={onClose}
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
};

export default withTranslation()(withStyles(styles)(DeleteFolder));
