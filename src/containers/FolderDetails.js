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
import moment from 'moment';
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
      props.history.push('/' + props.domain + '/folders');
    }
    else this.state = {
      changes: folder,
      editing: !!folder.ID,
    };
  }

  types = [
    { name: 'mail and post items', ID: 0 },
    { name: 'contact', ID: 1 },
    { name: 'journal', ID: 2 },
    { name: 'calendar', ID: 3 },
    { name: 'note', ID: 4 },
    { name: 'task', ID: 5 },
    { name: 'infopath items', ID: 6 },
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
    this.props.add(this.props.domain, {
      ...this.state.changes,
      createDay: moment(this.state.changes.createDay).format('YYYY-MM-DD HH:mm').toString(),
    });
  }

  handleEdit = () => {
    this.props.edit(this.props.domain, {
      ...this.state.changes,
      createDay: moment(this.state.changes.createDay).format('YYYY-MM-DD HH:mm').toString(),
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
                label={t("folder name")} 
                fullWidth 
                value={changes.folderName || ''}
                onChange={this.handleInput('folderName')}
              />
              <TextField
                select
                className={classes.input}
                label={t("folder type")}
                fullWidth
                value={changes.folderType || 0}
                onChange={this.handleInput('folderType')}
              >
                {this.types.map((type, key) => (
                  <MenuItem key={key} value={type.ID}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField 
                className={classes.input} 
                label={t("folder name")} 
                fullWidth 
                value={changes.folderName || ''}
                onChange={this.handleInput('folderName')}
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
  domain: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domain, folder) => {
      await dispatch(addFolderData(domain, folder));
    },
    edit: async (domain, folder) => {
      await dispatch(editFolderData(domain, folder));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(FolderDetails)));