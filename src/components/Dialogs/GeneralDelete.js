// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';

const styles = {
  
};

class GeneralDelete extends PureComponent {

  state = {
    loading: false,
  }

  handleDelete = () => {
    const { id, onSuccess, onError } = this.props;
    this.setState({ loading: true });
    this.props.delete(id)
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
    const { t, open, item, onClose } = this.props;
    const { loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('deleteDialog', { item })}?</DialogTitle>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleDelete}
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

GeneralDelete.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(GeneralDelete));
