// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';

const styles = {
  
};

class DomainDataDelete extends PureComponent {

  state = {
    loading: false,
  }

  handleDelete = () => {
    const { id, onSuccess, onError, domainID } = this.props;
    this.setState({ loading: true });
    this.props.delete(domainID, id)
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
    const { t, open, item, onClose } = this.props;
    const { loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to delete {item}?</DialogTitle>
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

DomainDataDelete.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.number,
  domainID: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(DomainDataDelete));
