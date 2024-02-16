// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions, FormControlLabel, Checkbox, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { deleteUserData } from '../../actions/users';

const styles = {
  
};

class DeleteUser extends PureComponent {

  state = {
    deleteFiles: false,
    deleteChatUser: false,
    loading: false,
  }

  handleDelete = () => {
    const { user, domainID, onSuccess, onError } = this.props;
    const { deleteFiles, deleteChatUser } = this.state;
    this.setState({ loading: true });
    this.props.delete(domainID, user.ID, { deleteFiles, deleteChatUser })
      .then(() => {
        if(onSuccess) onSuccess();
        this.setState({ loading: false });
      })
      .catch(() => {
        if(onError) onError();
        this.setState({ loading: false });
      });
  }

  handleCheckbox = field => () => this.setState(state => ({ [field]: !state[field] }));

  render() {
    const { t, open, user, onClose } = this.props;
    const { deleteFiles, deleteChatUser, loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to delete {user.username}?</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteFiles}
                onChange={this.handleCheckbox("deleteFiles")}
                name="deleteFiles"
                color="primary"
              />
            }
            label={t("Delete files?")}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteChatUser}
                onChange={this.handleCheckbox("deleteChatUser")}
                name="deleteChatUser"
                color="primary"
              />
            }
            label={t("Delete grommunio-chat user")}
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

DeleteUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  user: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  domainID: PropTypes.number.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    delete: async (domainID, id, params) => {
      await dispatch(deleteUserData(domainID, id, params))
        .catch(error => Promise.reject(error));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DeleteUser)));
