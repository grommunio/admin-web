import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Paper,
  TextField,
  FormControl,
  MenuItem,
  Button,
  Typography,
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
    marginTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
});

class Config extends Component {

  state = {
    changes: {},
  }

  reportTypes = [
    { name: 'none report', ID: 0 },
    { name: 'daily brief', ID: 1 },
    { name: 'daily report', ID: 2 },
    { name: 'mensual statistics', ID: 3 },
  ];

  expires = [
    { name: '1 week', ID: 0 },
    { name: '1 month', ID: 1 },
    { name: '1 year', ID: 2 },
    { name: '100 years', ID: 3 },
    { name: 'never', ID: 4 },
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

  render() {
    const { classes, t } = this.props;
    const { changes } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title="Configuration"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Paper className={classes.paper} elevation={1}>
              <Typography>What is this category?</Typography>
              <FormControl className={classes.form}>
                <TextField 
                  className={classes.input} 
                  label={t("administrator's email")} 
                  fullWidth 
                  value={changes.adminEmail || ''}
                  onChange={this.handleInput('adminEmail')}
                  autoFocus
                />
                <TextField
                  select
                  className={classes.input}
                  label={t("display/report language")}
                  fullWidth
                  value={changes.displayLanguage || 0}
                  onChange={this.handleInput('displayLanguage')}
                >
                  <MenuItem value={0}>
                    auto
                  </MenuItem>
                  <MenuItem value={1}>
                    english
                  </MenuItem>
                </TextField>
                <TextField
                  select
                  className={classes.input}
                  label={t("report type")}
                  fullWidth
                  value={changes.reportType || 0}
                  onChange={this.handleInput('reportType')}
                >
                  {this.reportTypes.map((type, key) => (
                    <MenuItem key={key} value={type.ID}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Paper>
            <Paper className={classes.paper} elevation={1}>
              <Typography>if list type is &quot;deny&quot;, transporting with these items are forbidden;
                if type is &quot;allow&quot;, only items are allowed to be transported with</Typography>
              <FormControl className={classes.form}>
                <TextField
                  select
                  className={classes.input}
                  label={t("limit list type")}
                  fullWidth
                  value={changes.limit || 0}
                  onChange={this.handleInput('limit')}
                >
                  <MenuItem value={0}>
                    deny list type
                  </MenuItem>
                  <MenuItem value={1}>
                    allow list type
                  </MenuItem>
                </TextField>
              </FormControl>
            </Paper>
            <Paper className={classes.paper} elevation={1}>
              <Typography>all mails to unavailable users will be redirect to the mailbox</Typography>
              <FormControl className={classes.form}>
                <TextField
                  className={classes.input}
                  label={t("unavailable user collecting mailbox")}
                  fullWidth
                  value={changes.unavailable || ''}
                  onChange={this.handleInput('unavailable')}
                />
              </FormControl>
            </Paper>
            <Paper className={classes.paper} elevation={1}>
              <Typography>except specified users, all users&quot; default expire date will be the set date</Typography>
              <FormControl className={classes.form}>
                <TextField
                  select
                  className={classes.input}
                  label={t("default password expire date")}
                  fullWidth
                  value={changes.expires || 0}
                  onChange={this.handleInput('expires')}
                >
                  {this.expires.map((date, key) => (
                    <MenuItem key={key} value={date.ID}>
                      {date.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Paper>
            <Paper className={classes.paper} elevation={1}>
              <Typography>reject the mail directly or forward the mail to someone for approving manually</Typography>
              <FormControl className={classes.form}>
                <TextField
                  select
                  className={classes.input}
                  label={t("default password expire date")}
                  fullWidth
                  value={changes.expires || 0}
                  onChange={this.handleInput('expires')}
                >
                  <MenuItem value={0}>
                    reject directly
                  </MenuItem>
                  <MenuItem value={1}>
                    approving manually
                  </MenuItem>
                </TextField>
                <TextField
                  className={classes.input}
                  label={t("approving maibox")}
                  fullWidth
                  value={changes.approving || ''}
                  onChange={this.handleInput('approving')}
                />
                <TextField
                  select
                  className={classes.input}
                  label={t("tip mail language")}
                  fullWidth
                  value={changes.mailLanguage || 0}
                  onChange={this.handleInput('mailLanguage')}
                >
                  <MenuItem value={0}>
                    english
                  </MenuItem>
                </TextField>
              </FormControl>
            </Paper>
            <Paper className={classes.paper} elevation={1}>
              <Typography>Change password</Typography>
              <FormControl className={classes.form}>
                <TextField
                  className={classes.input}
                  label={t("old password")}
                  fullWidth
                  value={changes.oldPw || ''}
                  onChange={this.handleInput('oldPw')}
                />
                <TextField
                  className={classes.input}
                  label={t("new password")}
                  fullWidth
                  value={changes.newPw || ''}
                  onChange={this.handleInput('newPw')}
                />
                <TextField
                  className={classes.input}
                  label={t("retype new password")}
                  fullWidth
                  value={changes.retypeNewPw || ''}
                  onChange={this.handleInput('retypeNewPw')}
                />
              </FormControl>
            </Paper>
            <Button
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

Config.propTypes = {
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
    add: async (domain, folder) => {
      await dispatch(addFolderData(domain, folder));
    },
    edit: async (domain, folder) => {
      await dispatch(editFolderData(domain, folder));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Config)));