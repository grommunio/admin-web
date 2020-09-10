import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';

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
      .catch(() => {
        if(onError) onError();
        this.setState({ loading: false });
      });
  }

  render() {
    const { t, open, item, onSuccess } = this.props;
    const { loading } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to delete {item}?</DialogTitle>
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
  item: PropTypes.string,
  id: PropTypes.number.isRequired,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(DeleteUser));