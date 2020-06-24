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
import { addDomainData, editDomainData } from '../actions/domains';

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
      };
    }
    else this.state = {
      changes: domain,
      editing: !!domain.ID,
    };
  }

  storageTypes = [
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

  handleAdd = () => {
    const { endDay, createDay } = this.state.changes;
    this.props.add({
      ...this.state.changes,
      endDay: moment(endDay).format('YYYY-MM-DD HH:mm').toString(),
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      privilegeBits: 0,
    });
  }

  handleEdit = () => {
    const { endDay, createDay } = this.state.changes;
    this.props.edit({
      ...this.state.changes,
      endDay: moment(endDay).format('YYYY-MM-DD HH:mm').toString(),
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      privilegeBits: 0,
    });
  }

  render() {
    const { classes, t } = this.props;
    const changes = this.state.changes;

    return (
      <div className={classes.root}>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {this.state.editing ? t('Edit domain') : t("Add domain")}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("domain")} 
                fullWidth 
                value={changes.domainname || ''}
                onChange={this.handleInput('domainname')}
              />
              <TextField
                select
                className={classes.input}
                label={t("domain type")}
                fullWidth
                value={changes.domainType || 0}
                onChange={this.handleInput('domainType')}
              >
                {this.storageTypes.map((storageType, key) => (
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
                    checked={changes.mailArchive || false}
                    onChange={this.handleCheckbox('mailArchive')}
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
              <FormControlLabel
                label={t('extended cryptosecurity')}
                control={
                  <Checkbox
                    checked={changes.extendedCryptosecurity || false}
                    onChange={this.handleCheckbox('extendedCryptosecurity')}
                  />
                }
              />
            </Grid>
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

DomainListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    add: async domain => {
      await dispatch(addDomainData(domain));
    },
    edit: async domain => {
      await dispatch(editDomainData(domain));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainListDetails)));