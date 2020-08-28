import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, FormControlLabel, Grid, Checkbox, Button, DialogActions,
  Select, 
} from '@material-ui/core';
import { fetchAreasData } from '../../actions/areas';
import { addDomainData } from '../../actions/domains';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
});

class AddDomain extends PureComponent {

  state = {
    domainname: '',
    password: '',
    domainType: 0,
    areaID: '',
    domainStatus: 0,
    maxSize: '',
    maxUser: '',
    title: '',
    address: '',
    adminName: '',
    tel: '',
    mailBackup: false,
    mailMonitor: false,
    mailSubSystem: true,
    ignoreCheckingUser: false,
    sizeUnit: 0,
  }

  componentDidMount() {
    this.props.fetchAreas()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
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
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      [field]: input,
    });
  }

  handleAdd = () => {
    const { endDay, createDay, password, maxSize } = this.state;
    this.props.add({
      ...this.state,
      sizeUnit: undefined,
      endDay: moment(endDay).format('YYYY-MM-DD HH:mm').toString(),
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      password: password || undefined,
      maxSize: maxSize << (10 * this.state.sizeUnit),
    })
      .then(() => {
        this.setState({
          domainname: '',
          password: '',
          storageType: 0,
          areaID: '',
          domainStatus: 0,
          maxSize: '',
          maxUser: '',
          title: '',
          address: '',
          adminName: '',
          tel: '',
          mailBackup: false,
          mailMonitor: false,
          mailSubSystem: true,
          ignoreCheckingUser: false,
          sizeUnit: 0,
        });
        this.props.onSuccess();
      })
      .catch(error => this.props.onError(error));
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value })

  render() {
    const { classes, t, domainAreas, open, onSuccess } = this.props;
    const { domainname, password, domainType, areaID, domainStatus,
      maxSize, maxUser, title, address, adminName, tel, mailBackup,
      mailMonitor, mailSubSystem, ignoreCheckingUser, sizeUnit } = this.state;
    const domainError = !domainname.match(
      /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/);

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("domain")} 
              fullWidth 
              value={domainname || ''}
              onChange={this.handleInput('domainname')}
              autoFocus
              required
              error={!!domainname && domainError}
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
              label={t("storage type")}
              fullWidth
              value={domainType || 0}
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
                      value={sizeUnit}
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
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ addOpen: false })}
            variant="contained"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!domainname || password.length < 6 || domainError}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddDomain.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  domainAreas: PropTypes.array.isRequired,
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
  withTranslation()(withStyles(styles)(AddDomain)));