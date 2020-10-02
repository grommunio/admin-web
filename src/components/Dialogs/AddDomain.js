import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, FormControlLabel, Grid, Checkbox, Button, DialogActions,
  Select,
  CircularProgress, 
} from '@material-ui/core';
import { fetchAreasData } from '../../actions/areas';
import { addDomainData } from '../../actions/domains';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  select: {
    minWidth: 60,
  },
});

class AddDomain extends PureComponent {

  state = {
    domainname: '',
    password: '',
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
    netDisk: false,
    sizeUnit: 0,
    loading: false,
  }

  componentDidMount() {
    this.props.fetchAreas()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
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
    const { domainname, password, areaID, domainStatus, maxUser,
      title, address, adminName, tel, mailBackup, mailMonitor, mailSubSystem,
      ignoreCheckingUser, sizeUnit, maxSize, netDisk } = this.state;
    this.setState({ loading: true });
    this.props.add({
      domainname,
      password: password || undefined,
      areaID,
      domainStatus,
      maxUser,
      title,
      address,
      adminName,
      tel,
      mailBackup,
      mailMonitor,
      mailSubSystem,
      ignoreCheckingUser,
      netDisk,
      maxSize: maxSize << (10 * sizeUnit),
    })
      .then(() => {
        this.setState({
          domainname: '',
          password: '',
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
          netDisk: false,
          sizeUnit: 0,
          loading: false,
        });
        this.props.onSuccess();
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value })

  render() {
    const { classes, t, domainAreas, open, onSuccess } = this.props;
    const { domainname, password, areaID, domainStatus,
      maxSize, maxUser, title, address, adminName, tel, mailBackup,
      mailMonitor, mailSubSystem, ignoreCheckingUser, netDisk, sizeUnit, loading } = this.state;
    const domainError = !domainname.match(
      /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/);

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Domain' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Domain")} 
              fullWidth 
              value={domainname || ''}
              onChange={this.handleInput('domainname')}
              autoFocus
              required
              error={!!domainname && domainError}
            />
            <TextField 
              className={classes.input} 
              label={t("Password")} 
              fullWidth 
              value={password || ''}
              onChange={this.handleInput('password')}
              type="password"
              required
            />
            <TextField
              select
              className={classes.input}
              label={t("Data area")}
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
              label={t("Status")}
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
              label={t("Maximum space")} 
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
                      <MenuItem value={0}>MiB</MenuItem>
                      <MenuItem value={1}>GiB</MenuItem>
                      <MenuItem value={2}>TiB</MenuItem>
                    </Select>
                  </FormControl>,
              }}
            />
            <TextField 
              className={classes.input} 
              label={t("Maximum users")} 
              fullWidth 
              value={maxUser || ''}
              onChange={this.handleNumberInput('maxUser')}
            />
            <TextField 
              className={classes.input} 
              label={t("Title")} 
              fullWidth 
              value={title || ''}
              onChange={this.handleInput('title')}
            />
            <TextField 
              className={classes.input} 
              label={t("Address")} 
              fullWidth 
              value={address || ''}
              onChange={this.handleInput('address')}
            />
            <TextField 
              className={classes.input} 
              label={t("Administrator")} 
              fullWidth 
              value={adminName || ''}
              onChange={this.handleInput('adminName')}
            />
            <TextField 
              className={classes.input} 
              label={t("Telephone")} 
              fullWidth 
              value={tel || ''}
              onChange={this.handleInput('tel')}
            />
          </FormControl>
          <Grid container className={classes.input}>
            <FormControlLabel
              label={t('Mail archive')}
              control={
                <Checkbox
                  checked={mailBackup || false}
                  onChange={this.handleCheckbox('mailBackup')}
                />
              }
            />
            <FormControlLabel
              label={t('Mail monitor')}
              control={
                <Checkbox
                  checked={mailMonitor || false}
                  onChange={this.handleCheckbox('mailMonitor')}
                />
              }
            />
            <FormControlLabel
              label={t('Ignore checking user')}
              control={
                <Checkbox
                  checked={ignoreCheckingUser || false}
                  onChange={this.handleCheckbox('ignoreCheckingUser')}
                />
              }
            />
            <FormControlLabel
              label={t('Mail subsystem')}
              control={
                <Checkbox
                  checked={mailSubSystem || false}
                  onChange={this.handleCheckbox('mailSubSystem')}
                />
              }
            />
            <FormControlLabel
              label={t('Net disk')}
              control={
                <Checkbox
                  checked={netDisk || false}
                  onChange={this.handleCheckbox('netDisk')}
                />
              }
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={loading || !domainname || password.length < 6 || domainError}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
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