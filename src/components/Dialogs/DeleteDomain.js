// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, FormControlLabel, Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { DOMAIN_PURGE } from '../../constants';

const styles = {
  
};

class DeleteDomain extends PureComponent {

  state = {
    loading: false,
    purge: false,
    deleteFiles: false,
  }

  handleDelete = () => {
    const { id, onSuccess, onError } = this.props;
    const { purge, deleteFiles } = this.state;
    this.setState({ loading: true });
    this.props.delete(id, { purge, deleteFiles })
      .then(() => {
        if(onSuccess) onSuccess();
        this.setState({ loading: false });
      })
      .catch(err => {
        if(onError) onError(err);
        this.setState({ loading: false });
      });
  }

  handlePurge = e => {
    const val = e.target.checked;
    this.setState({
      purge: val,
      deleteFiles: false,
    });
  }

  render() {
    const { t, open, item, onClose, capabilities } = this.props;
    const { loading, purge, deleteFiles } = this.state;
    const canPurge = capabilities.includes(DOMAIN_PURGE);
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('deleteDialog', { item })}?</DialogTitle>
        {canPurge && <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={purge}
                onChange={this.handlePurge}
                name="checked"
                color="primary"
              />
            }
            label={t("Delete permanently?")}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteFiles}
                onChange={() => this.setState({ deleteFiles: !deleteFiles })}
                name="checked"
                color="primary"
                disabled={!purge}
              />
            }
            label={t("Delete files?")}
          />
        </DialogContent>}
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

DeleteDomain.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  capabilities: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    capabilities: state.auth.capabilities,
  };
};

export default connect(mapStateToProps)(
  withTranslation()(withStyles(styles)(DeleteDomain))); 
