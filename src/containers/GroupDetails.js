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
import { addGroupData, editGroupData } from '../actions/groups';

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
    const domain = this.props.location.state;
    if(!domain) {
      this.props.history.push('/groups');
      this.state = {
        changes: {},
      };
    }
    else this.state = {
      changes: domain,
      editing: !!domain.ID,
    };
  }

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
    const { createDay } = this.state.changes;
    this.props.add({
      ...this.state.changes,
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      privilegeBits: 0,
    });
  }

  handleEdit = () => {
    const { createDay } = this.state.changes;
    this.props.edit({
      ...this.state.changes,
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      privilegeBits: 0,
    });
  }

  render() {
    const { classes, t, domains } = this.props;
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
                {this.state.editing ? t('Edit group') : t("Add group")}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("group name")} 
                fullWidth 
                value={changes.groupname || ''}
                onChange={this.handleInput('groupname')}
              />
              <TextField
                type="password"
                className={classes.input}
                label={t("password")}
                fullWidth
                value={changes.password || ''}
                onChange={this.handleInput('password')}
              />
              <TextField
                select
                className={classes.input}
                label={t("status")}
                fullWidth
                value={changes.groupStatus || 0}
                onChange={this.handleInput('groupStatus')}
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
                label={t("domain")}
                fullWidth
                value={changes.domainID || 0}
                onChange={this.handleInput('domainID')}
              >
                <MenuItem value={0}>None</MenuItem>
                {domains.Domains.map((domain, key) => (
                  <MenuItem key={key} value={domain.ID}>
                    {domain.domainname}
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
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  className={classes.input} 
                  label="begin date"
                  value={changes.createDay || new Date()}
                  onChange={this.handleDateChange('createDay')}
                  autoOk
                />
              </MuiPickersUtilsProvider>
            </FormControl>
            <Grid container className={classes.input}>
              <FormControlLabel
                label={t('mail backup search')}
                control={
                  <Checkbox
                    checked={changes.backup || false}
                    onChange={this.handleCheckbox('backup')}
                  />
                }
              />
              <FormControlLabel
                label={t('mail monitor')}
                control={
                  <Checkbox
                    checked={changes.monitor || false}
                    onChange={this.handleCheckbox('monitor')}
                  />
                }
              />
              <FormControlLabel
                label={t('ignore checking user')}
                control={
                  <Checkbox
                    checked={changes.log || false}
                    onChange={this.handleCheckbox('log')}
                  />
                }
              />
              <FormControlLabel
                label={t('mail sub system')}
                control={
                  <Checkbox
                    checked={changes.account || false}
                    onChange={this.handleCheckbox('account')}
                  />
                }
              />
            </Grid>
            <Button
              variant="text"
              color="secondary"
              onClick={() => this.props.history.push('/groups')}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.state.editing ? this.handleEdit: this.handleAdd}
              disabled={!changes.domainID}
            >
              Save
            </Button>
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
  domains: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { domains: state.domains };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async group => {
      await dispatch(addGroupData(group));
    },
    edit: async group => {
      await dispatch(editGroupData(group));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(GroupDetails)));