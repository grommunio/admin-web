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
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { connect } from 'react-redux';
import { editDomainData } from '../actions/domains';
import TopBar from '../components/TopBar';
import { changeDomainPassword } from '../api';
import Alert from '@material-ui/lab/Alert';

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
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
});

class DomainListDetails extends PureComponent {

  constructor(props) {
    super(props);
    const domain = this.props.location.state;
    if(!domain) {
      this.props.history.push('/domainList');
      this.state = {
        changes: {},
        changingPw: false,
        newPw: '',
        checkPw: '',
      };
    }
    else this.state = {
      changes: domain.ID ? domain : {
        orgID: 1,
        domainname: '',
        //password: '',
        media: '',
        maxSize: 0,
        maxUser: 0,
        title: '',
        address: '',
        adminName: '',
        tel: '',
        domainStatus: 0,
        domainType: 0,
        mailBackup: false,
        mailMonitor: false,
        ignoreCheckingUser: false,
        mailSubSystem: false,
        netDisk: false,
      },
      changingPw: false,
      newPw: '',
      checkPw: '',
      snackbar: null,
    };
  }

  domainTypes = [
    { name: 'default storage', ID: 0 },
  ]

  statuses = [
    { name: 'normal', ID: 0 },
    { name: 'suspended', ID: 1 },
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

  handleCheckbox = field => event => this.setState({
    changes: {
      ...this.state.changes,
      [field]: event.target.checked,
    },
    unsaved: true,
  });

  handleDateChange = field => date => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: date,
      },
    });
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: input,
      },
    });
  }

  handleEdit = () => {
    const { endDay, createDay } = this.state.changes;
    this.props.edit({
      ...this.state.changes,
      endDay: moment(endDay).format('YYYY-MM-DD HH:mm').toString(),
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handlePasswordChange = async () => {
    const { changes, newPw } = this.state;
    await changeDomainPassword(changes.ID, newPw);
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }


  render() {
    const { classes, t } = this.props;
    const { changes, checkPw, newPw, changingPw } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title="Domain List"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('Edit domain')}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <Grid container className={classes.input}>
                <TextField
                  label={t("domain")} 
                  style={{ flex: 1, marginRight: 8 }} 
                  value={changes.domainname || ''}
                  onChange={this.handleInput('domainname')}
                  autoFocus
                />
                <Button
                  variant="contained"
                  onClick={() => this.setState({ changingPw: true })}
                  size="small"
                >
                  Change Password
                </Button>
              </Grid>
              <TextField
                select
                className={classes.input}
                label={t("domain type")}
                fullWidth
                value={changes.domainType || 0}
                onChange={this.handleInput('domainType')}
              >
                {this.domainTypes.map((storageType, key) => (
                  <MenuItem key={key} value={storageType.ID}>
                    {storageType.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("status")}
                fullWidth
                value={changes.domainStatus || 0}
                onChange={this.handleInput('domainStatus')}
              >
                {this.statuses.map((status, key) => (
                  <MenuItem key={key} value={status.ID}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField 
                className={classes.input} 
                label={t("maximum space")} 
                fullWidth 
                value={changes.maxSize || ''}
                onChange={this.handleNumberInput('maxSize')}
                InputProps={{
                  endAdornment: <InputAdornment position="start">G</InputAdornment>,
                }}
              />
              <TextField 
                className={classes.input} 
                label={t("maximum users")} 
                fullWidth 
                value={changes.maxUser || ''}
                onChange={this.handleNumberInput('maxUser')}
              />
              <TextField 
                className={classes.input} 
                label={t("title")} 
                fullWidth 
                value={changes.title || ''}
                onChange={this.handleInput('title')}
              />
              <TextField 
                className={classes.input} 
                label={t("address")} 
                fullWidth 
                value={changes.address || ''}
                onChange={this.handleInput('address')}
              />
              <TextField 
                className={classes.input} 
                label={t("media")} 
                fullWidth 
                value={changes.media || ''}
                onChange={this.handleInput('media')}
              />
              <TextField 
                className={classes.input} 
                label={t("administrator")} 
                fullWidth 
                value={changes.adminName || ''}
                onChange={this.handleInput('adminName')}
              />
              <TextField 
                className={classes.input} 
                label={t("telephone")} 
                fullWidth 
                value={changes.tel || ''}
                onChange={this.handleInput('tel')}
              />
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  className={classes.input} 
                  label="begin date"
                  value={changes.createDay || new Date()}
                  onChange={this.handleDateChange('createDay')}
                  autoOk
                />
                <DatePicker
                  className={classes.input}
                  label="end date"
                  value={changes.endDay || new Date()}
                  onChange={this.handleDateChange('endDay')}
                  autoOk
                />
              </MuiPickersUtilsProvider>
            </FormControl>
            <Grid container className={classes.input}>
              <FormControlLabel
                label={t('mail archive')}
                control={
                  <Checkbox
                    checked={changes.mailBackup || false}
                    onChange={this.handleCheckbox('mailBackup')}
                  />
                }
              />
              <FormControlLabel
                label={t('mail monitor')}
                control={
                  <Checkbox
                    checked={changes.mailMonitor || false}
                    onChange={this.handleCheckbox('mailMonitor')}
                  />
                }
              />
              <FormControlLabel
                label={t('ignore checking user')}
                control={
                  <Checkbox
                    checked={changes.ignoreCheckingUser || false}
                    onChange={this.handleCheckbox('ignoreCheckingUser')}
                  />
                }
              />
              <FormControlLabel
                label={t('mail sub system')}
                control={
                  <Checkbox
                    checked={changes.mailSubSystem || false}
                    onChange={this.handleCheckbox('mailSubSystem')}
                  />
                }
              />
              <FormControlLabel
                label={t('net disk')}
                control={
                  <Checkbox
                    checked={changes.netDisk || false}
                    onChange={this.handleCheckbox('netDisk')}
                  />
                }
              />
            </Grid>
            <Button
              variant="text"
              color="secondary"
              onClick={() => this.props.history.push('/domainList')}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              Save
            </Button>
          </Paper>
          <Snackbar
            open={!!this.state.snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={this.state.snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={this.state.snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {this.state.snackbar}
            </Alert>
          </Snackbar>
        </div>
        <Dialog open={!!changingPw}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={event => this.setState({ newPw: event.target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={event => this.setState({ checkPw: event.target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={() => this.setState({ changingPw: false })}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DomainListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async domain => {
      await dispatch(editDomainData(domain)).catch(message => Promise.reject(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainListDetails)));