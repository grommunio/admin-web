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
} from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUserData, editUserData } from '../actions/users';
import TopBar from '../components/TopBar';

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
});

class UserDetails extends PureComponent {

  constructor(props) {
    super(props);
    const user = this.props.location.state;
    if(!user) {
      this.props.history.push('/users');
      this.state = {
        changes: {},
      };
    }
    else this.state = {
      changes: user,
      editing: !!user.ID,
    };
  }

  types = [
    { name: 'normal', ID: 0 },
    { name: 'room', ID: 1 },
    { name: 'equipment', ID: 2 },
  ]

  statuses = [
    { name: 'normal', ID: 0 },
    { name: 'suspended', ID: 1 },
    { name: 'out of date', ID: 2 },
    { name: 'deleted', ID: 3 },
  ]

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

  handleAdd = () => {
    this.props.add({
      ...this.state.changes,
      domainID: 420,
      groupID: 420,
      createDay: moment(this.state.changes.createDay).format('YYYY-MM-DD HH:mm').toString(),
      privilegeBits: 0,
    });
  }

  handleEdit = () => {
    this.props.edit({
      ...this.state.changes,
      createDay: moment(this.state.changes.createDay).format('YYYY-MM-DD HH:mm').toString(),
      privilegeBits: 0,
    });
  }

  render() {
    const { classes, t } = this.props;
    const changes = this.state.changes;

    return (
      <div className={classes.root}>
        <TopBar title="Users"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {this.state.editing ? t('Edit user') : t('Add user')}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("username")} 
                fullWidth 
                value={changes.username || ''}
                onChange={this.handleInput('username')}
              />
              <TextField 
                className={classes.input} 
                label={t("password")} 
                fullWidth
                type="password"
                value={changes.password || ''}
                onChange={this.handleInput('password')}
              />
              <TextField
                select
                className={classes.input}
                label={t("password expiration time")}
                fullWidth
                value={changes.expire || 0}
                onChange={this.handleInput('expire')}
              >
                {this.expires.map((expire, key) => (
                  <MenuItem key={key} value={expire.ID}>
                    {expire.name}
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
                select
                className={classes.input}
                label={t("types")}
                fullWidth
                value={changes.type || 0}
                onChange={this.handleInput('type')}
              >
                {this.types.map((type, key) => (
                  <MenuItem key={key} value={type.ID}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("language")}
                fullWidth
                value={changes.type || 0}
                onChange={this.handleInput('language')}
              >
                <MenuItem value={0}>
                  {t('english')}
                </MenuItem>
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("department")}
                fullWidth
                value={changes.type || 0}
                onChange={this.handleInput('department')}
              >
                <MenuItem value={0}>
                  {t('direct user')}
                </MenuItem>
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
                label={t("maximum file")} 
                fullWidth 
                value={changes.maxFile || ''}
                onChange={this.handleNumberInput('maxFile')}
              />
              <TextField 
                className={classes.input} 
                label={t("job title")} 
                fullWidth 
                value={changes.title || ''}
                onChange={this.handleInput('title')}
              />
              <TextField 
                className={classes.input} 
                label={t("real name")} 
                fullWidth 
                value={changes.realName || ''}
                onChange={this.handleInput('realName')}
              />
              <TextField 
                className={classes.input} 
                label={t("nick name")} 
                fullWidth 
                value={changes.nickname || ''}
                onChange={this.handleInput('nickname')}
              />
              <TextField 
                className={classes.input} 
                label={t("telephone")} 
                fullWidth 
                value={changes.tel || ''}
                onChange={this.handleInput('tel')}
              />
              <TextField 
                className={classes.input} 
                label={t("mobile phone")} 
                fullWidth 
                value={changes.mobilePhone || ''}
                onChange={this.handleInput('mobilePhone')}
              />
              <TextField 
                className={classes.input} 
                label={t("home address")} 
                fullWidth 
                value={changes.homeaddress || ''}
                onChange={this.handleInput('homeaddress')}
              />
              <TextField 
                className={classes.input} 
                label={t("memo")} 
                fullWidth
                value={changes.memo || ''}
                onChange={this.handleInput('memo')}
              />
            </FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                className={classes.input} 
                label="begin date"
                value={changes.createDay || new Date()}
                onChange={this.handleDateChange('createDay')}
                autoOk
              />
            </MuiPickersUtilsProvider>
            <Grid container className={classes.input}>
              <FormControlLabel
                label={t('allow pop3 or imap downloading')}
                control={
                  <Checkbox
                    checked={changes.pop3_imap || false}
                    onChange={this.handleCheckbox('pop3_imap')}
                  />
                }
              />
              <FormControlLabel
                label={t('allow smtp sending')}
                control={
                  <Checkbox
                    checked={changes.smtp || false}
                    onChange={this.handleCheckbox('smtp')}
                  />
                }
              />
              <FormControlLabel
                label={t('allow change password')}
                control={
                  <Checkbox
                    checked={changes.changePassword || false}
                    onChange={this.handleCheckbox('changePassword')}
                  />
                }
              />
              <FormControlLabel
                label={t('public user information')}
                control={
                  <Checkbox
                    checked={changes.publicAddress || false}
                    onChange={this.handleCheckbox('publicAddress')}
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
              onClick={() => this.props.history.push('/user')}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.state.editing ? this.handleEdit: this.handleAdd}
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    add: async user => {
      await dispatch(addUserData(user));
    },
    edit: async user => {
      await dispatch(editUserData(user));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserDetails)));