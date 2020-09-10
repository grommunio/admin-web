import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions, FormControlLabel, Checkbox, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { deleteUserData } from '../../actions/users';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  select: {
    minWidth: 60,
  },
});

class DeleteUser extends PureComponent {

  state = {
    checked: false,
    loading: false,
  }

  handleDelete = () => {
    const { user, domainID, onSuccess, onError } = this.props;
    this.setState({ loading: true });
    this.props.delete(domainID, user.ID, this.state.checked)
      .then(() => {
        if(onSuccess) onSuccess();
        this.setState({ loading: false });
      })
      .catch(() => {
        if(onError) onError();
        this.setState({ loading: false });
      });
  }

  render() {
    const { t, open, user, onSuccess } = this.props;
    const { checked, loading } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to delete {user.username}?</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={() => this.setState({ checked: !checked })}
                name="checked"
                color="primary"
              />
            }
            label="Delete files?"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
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

DeleteUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  domainID: PropTypes.number.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    delete: async (domainID, id, deleteFiles) => {
      await dispatch(deleteUserData(domainID, id, deleteFiles))
        .catch(error => Promise.reject(error));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DeleteUser)));