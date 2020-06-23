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
} from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DatePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';

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

class GroupDetails extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      changes: this.props.location.state || {},
      editing: !!this.props.location.state,
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
                {t("Add domain")}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("domain")} 
                fullWidth 
                value={changes.domain || ''}
                onChange={this.handleInput('domain')}
              />
              <TextField
                select
                className={classes.input}
                label={t("storage type")}
                fullWidth
                value={changes.storageType || 0}
                onChange={this.handleInput('storageType')}
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
                value={changes.status || 0}
                onChange={this.handleInput('status')}
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
                value={changes.maxSpace || ''}
                onChange={this.handleInput('maxSpace')}
              />
              <TextField 
                className={classes.input} 
                label={t("maximum users")} 
                fullWidth 
                value={changes.maxUsers || ''}
                onChange={this.handleInput('maxUsers')}
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
                value={changes.administrator || ''}
                onChange={this.handleInput('administrator')}
              />
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  className={classes.input} 
                  label="begin date"
                  value={changes.beginDate || new Date()}
                  onChange={this.handleDateChange('beginDate')}
                  autoOk
                />
                <DatePicker
                  className={classes.input}
                  label="end date"
                  value={changes.endDate || new Date()}
                  onChange={this.handleDateChange('endDate')}
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
            <Button variant="contained" color="primary">Save</Button>
          </Paper>
        </div>
      </div>
    );
  }
}

GroupDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(styles)(GroupDetails));