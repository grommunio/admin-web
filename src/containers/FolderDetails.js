import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  MenuItem,
  Button,
} from '@material-ui/core';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import { addFolderData, editFolderData } from '../actions/folders';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
});

class FolderDetails extends PureComponent {

  constructor(props) {
    super(props);
    const folder = props.location.state;
    if(!folder) {
      this.state = {
        changes: {},
      };
      props.history.push('/' + props.domain.domainname + '/folders');
    }
    else this.state = {
      changes: folder,
      editing: !!folder.ID,
    };
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
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleAdd = () => {
    const { name, container, comment } = this.state.changes;
    this.props.add(this.props.domain.ID, {
      name: name || '',
      container: container || 'IPF.Note',
      comment: comment || '',
    });
    this.props.history.push('/' + this.props.domain.domainname + '/folders');
  }

  handleEdit = () => {
    this.props.edit(this.props.domain.ID, {
      ...this.state.changes,
    });
  }

  render() {
    const { classes, t } = this.props;
    const { editing, changes } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title="Folders"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {editing ? t('Edit folder') : t('Add folder')}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("name")} 
                fullWidth 
                value={changes.name || ''}
                onChange={this.handleInput('name')}
                autoFocus
              />
              <TextField
                select
                className={classes.input}
                label={t("Container")}
                fullWidth
                value={changes.container || 'IPF.Note'}
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
                value={changes.comment || ''}
                onChange={this.handleInput('comment')}
              />
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={editing ? this.handleEdit: this.handleAdd}
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

FolderDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, folder) => {
      await dispatch(addFolderData(domainID, folder));
    },
    edit: async (domainID, folder) => {
      await dispatch(editFolderData(domainID, folder));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(FolderDetails)));