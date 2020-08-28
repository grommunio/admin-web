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
  Snackbar,
  IconButton,
  Select,
} from '@material-ui/core';
import moment from 'moment';
import { connect } from 'react-redux';
import { addDomainData } from '../actions/domains';
import TopBar from '../components/TopBar';
import Delete from '@material-ui/icons/Close';
import { fetchAreasData } from '../actions/areas';

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
    this.state = {
      changes: {
        orgID: 1,
        domainname: '',
        password: '',
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
        mailSubSystem: true,
      },
      snackbar: null,
      sizeUnit: 0,
    };
  }

  componentDidMount() {
    this.props.fetchAreas()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
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

  handleAdd = () => {
    const { endDay, createDay, password, maxSize } = this.state.changes;
    this.props.add({
      ...this.state.changes,
      endDay: moment(endDay).format('YYYY-MM-DD HH:mm').toString(),
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      password: password || undefined,
      maxSize: maxSize << (10 * this.state.sizeUnit),
    })
      .then(() => this.props.history.push('/domainList'))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value })

  render() {
    const { classes, t, domainAreas } = this.props;
    const { domainname, password, domainType, areaID, domainStatus,
      maxSize, maxUser, title, address, adminName, tel, mailBackup,
      mailMonitor, mailSubSystem, ignoreCheckingUser } = this.state.changes;
    const domainError = !domainname.match(
      /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/);

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
                {t("Add domain")}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("domain")} 
                fullWidth 
                value={domainname || ''}
                onChange={this.handleInput('domainname')}
                autoFocus
                required
                error={domainError && domainname}
              />
              <TextField 
                className={classes.input} 
                label={t("password")} 
                fullWidth 
                value={password || ''}
                onChange={this.handleInput('password')}
                type="password"
                required
              />
              <TextField
                select
                className={classes.input}
                label={t("Area")}
                fullWidth
                value={areaID || ''}
                onChange={this.handleInput('areaID')}
              >
                {domainAreas.map((area, key) => (
                  <MenuItem key={key} value={area.ID}>
                    {area.name} {area.masterPath}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("domain type")}
                fullWidth
                value={domainType || 0}
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
                value={domainStatus || 0}
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
                value={maxSize || ''}
                onChange={this.handleNumberInput('maxSize')}
                InputProps={{
                  endAdornment:
                    <FormControl>
                      <Select
                        onChange={this.handleUnitChange}
                        value={this.state.sizeUnit}
                        className={classes.select}
                      >
                        <MenuItem value={0}>MB</MenuItem>
                        <MenuItem value={1}>GB</MenuItem>
                        <MenuItem value={2}>TB</MenuItem>
                      </Select>
                    </FormControl>,
                }}
              />
              <TextField 
                className={classes.input} 
                label={t("maximum users")} 
                fullWidth 
                value={maxUser || ''}
                onChange={this.handleNumberInput('maxUser')}
              />
              <TextField 
                className={classes.input} 
                label={t("title")} 
                fullWidth 
                value={title || ''}
                onChange={this.handleInput('title')}
              />
              <TextField 
                className={classes.input} 
                label={t("address")} 
                fullWidth 
                value={address || ''}
                onChange={this.handleInput('address')}
              />
              <TextField 
                className={classes.input} 
                label={t("administrator")} 
                fullWidth 
                value={adminName || ''}
                onChange={this.handleInput('adminName')}
              />
              <TextField 
                className={classes.input} 
                label={t("telephone")} 
                fullWidth 
                value={tel || ''}
                onChange={this.handleInput('tel')}
              />
            </FormControl>
            <Grid container className={classes.input}>
              <FormControlLabel
                label={t('mail archive')}
                control={
                  <Checkbox
                    checked={mailBackup || false}
                    onChange={this.handleCheckbox('mailBackup')}
                  />
                }
              />
              <FormControlLabel
                label={t('mail monitor')}
                control={
                  <Checkbox
                    checked={mailMonitor || false}
                    onChange={this.handleCheckbox('mailMonitor')}
                  />
                }
              />
              <FormControlLabel
                label={t('ignore checking user')}
                control={
                  <Checkbox
                    checked={ignoreCheckingUser || false}
                    onChange={this.handleCheckbox('ignoreCheckingUser')}
                  />
                }
              />
              <FormControlLabel
                label={t('mail sub system')}
                control={
                  <Checkbox
                    checked={mailSubSystem || false}
                    onChange={this.handleCheckbox('mailSubSystem')}
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
              onClick={this.handleAdd}
              disabled={!domainname || password.length < 6 || domainError}
            >
              Save
            </Button>
          </Paper>
          <Snackbar
            open={!!this.state.snackbar}
            message={this.state.snackbar}
            action={
              <IconButton size="small" onClick={() => this.setState({ snackbar: '' })}>
                <Delete color="error" />
              </IconButton>
            }
          />
        </div>
      </div>
    );
  }
}

DomainListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domainAreas: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  add: PropTypes.func.isRequired,
  fetchAreas: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    domainAreas: state.areas.Areas.domain || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAreas: async () => {
      await dispatch(fetchAreasData()).catch(msg => Promise.reject(msg));
    },
    add: async domain => {
      await dispatch(addDomainData(domain)).catch(message => Promise.reject(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainListDetails)));