// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { deleteOwnerData } from '../../actions/folders';
import { connect } from 'react-redux';

const styles = {
  
};

class RemoveOwner extends PureComponent {

  state = {
    loading: false,
  }

  handleDelete = () => {
    const { folderID, memberID, onSuccess, onError, domainID } = this.props;
    this.setState({ loading: true });
    this.props.delete(domainID, folderID, memberID)
      .then(() => {
        if(onSuccess) onSuccess();
        this.setState({ loading: false });
      })
      .catch(error => {
        if(onError) onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { t, open, ownerName, onClose } = this.props;
    const { loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to remove {ownerName} from this folder?</DialogTitle>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
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

RemoveOwner.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  ownerName: PropTypes.string,
  domainID: PropTypes.number,
  folderID: PropTypes.string,
  memberID: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    delete: async (domainID, folderID, memberID) => {
      await dispatch(deleteOwnerData(domainID, folderID, memberID)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(RemoveOwner)));
