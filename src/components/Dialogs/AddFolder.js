import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addFolderData } from '../../actions/folders';

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

class AddFolder extends PureComponent {

  state = {
    displayname: '',
    container: 'IPF.Note',
    comment: '',
    loading: false,
  }

  types = [
    { name: 'Mail and post items', ID: 'IPF.Note' },
    { name: 'Contact', ID: 'IPF.Contact' },
    { name: 'Appointment', ID: 'IPF.Appointment' },
    { name: 'Sticky note', ID: 'IPF.Stickynote' },
    { name: 'Task', ID: 'IPF.Task' },
  ]

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleAdd = () => {
    const { add, onSuccess, onError, domain } = this.props;
    this.setState({ loading: true });
    add(domain.ID, {
      ...this.state,
      loading: undefined,
    })
      .then(() => {
        this.setState({
          displayname: '',
          container: 'IPF.Note',
          comment: '',
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { classes, t, open, onSuccess } = this.props;
    const { displayname, container, comment, loading } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              label={t("Folder name")}
              value={displayname}
              onChange={this.handleInput('displayname')}
              className={classes.input}
              autoFocus
            />
            <TextField
              select
              className={classes.input}
              label={t("Container")}
              fullWidth
              value={container || ''}
              onChange={this.handleInput('container')}
            >
              {this.types.map((type, key) => (
                <MenuItem key={key} value={type.ID}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              className={classes.input} 
              label={t("Comment")} 
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={this.handleInput('comment')}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!displayname || loading}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddFolder.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  return {
    groups: state.groups,
    userAreas: state.areas.Areas.user || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, folder) => {
      await dispatch(addFolderData(domainID, folder));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddFolder)));