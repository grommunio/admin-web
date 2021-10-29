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
  }

  handleDelete = () => {
    const { id, onSuccess, onError, domainID } = this.props;
    const { clear } = this.state;
    this.setState({ loading: true });
    this.props.delete(domainID, id, { clear })
      .then(() => {
        if(onSuccess) onSuccess();
        this.setState({ loading: false, clear: false });
      })
      .catch(error => {
        if(onError) onError(error);
        this.setState({ loading: false, clear: false });
      });
  }

  handleCheckbox = e => this.setState({ clear: e.target.checked })

  render() {
    const { t, open, item, onClose } = this.props;
    const { loading, clear } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to delete {item}?</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Checkbox onChange={this.handleCheckbox} value={clear} />}
            label={t('Clear folder data')}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleDelete}
            variant="contained"
            color="secondary"
          >
            {loading ? <CircularProgress size={24}/> : t('Confirm')}
          </Button>
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
