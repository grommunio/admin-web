// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, Checkbox, FormControlLabel, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { importLdapData } from '../../actions/ldap';
import { connect } from 'react-redux';

const styles = {
};

class ImportDialog extends PureComponent {

  state = {
    loading: false,
    force: false,
  }

  handleChange = event => {
    this.setState({ force: event.target.checked });
  };

  handleImport = () => {
    const { importUser, onSuccess, onError, user } = this.props;
    const { force } = this.state;
    this.setState({ loading: true });
    importUser({ ID: user.ID, force })
      .then(() => {
        if(onSuccess) onSuccess();
        this.setState({ loading: false });
      })
      .catch(err => {
        if(onError) onError(err);
        this.setState({ loading: false });
      });
  }

  render() {
    const { t, open, user, onClose } = this.props;
    const { loading, force } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to import {user.name}?</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={force}
                onChange={this.handleChange}
                color="primary"
              />
            }
            label="force"
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
            onClick={this.handleImport}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24}/> : t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ImportDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  user: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  importUser: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    importUser: async params => await dispatch(importLdapData(params))
      .catch(err => Promise.reject(err)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ImportDialog)));
