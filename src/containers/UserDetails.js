// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

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
  DialogTitle,
  DialogContent, Dialog, DialogActions, Select, Snackbar,
  InputLabel, Tabs, Tab, List, ListItem, IconButton, Divider, FormControlLabel, Checkbox,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles } from '../actions/users';
import TopBar from '../components/TopBar';
import { changeUserPassword } from '../api';
import { fetchRolesData } from '../actions/roles';
import Alert from '@material-ui/lab/Alert';
import Close from '@material-ui/icons/Delete';
import Sync from '@material-ui/icons/Sync';
import Detach from '@material-ui/icons/SyncDisabled';
import world from '../res/world.json';
import { syncLdapData } from '../actions/ldap';
import DetachDialog from '../components/Dialogs/DetachDialog';

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
    margin: theme.spacing(1),
  },
  propertyInput: {
    margin: theme.spacing(1),
    flex: 1,
  },
  toolbar: theme.mixins.toolbar,
  grid: {
    display: 'flex',
    margin: theme.spacing(1),
    flex: 1,
  },
  select: {
    minWidth: 60,
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  list: {
    padding: 0,
    marginTop: -8,
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
  flexTextfield: {
    flex: 1,
    marginRight: 8,
  },
  column: {
    margin: theme.spacing(1, 2),
  },
  address: {
    height: 128,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  textarea: {
    height: 84,
  },
  gridItem: {
    display: 'flex',
  },
  syncButtons: {
    margin: theme.spacing(2, 0),
  },
  leftIcon: {
    marginRight: 4,
  },
});

class UserDetails extends PureComponent {

  state = {
    user: {
      roles: [],
      properties: {},
    },
    changingPw: false,
    newPw: '',
    checkPw: '',
    snackbar: '',
    tab: 0,
    sizeUnit: 1,
    detaching: false,
    detachLoading: false,
  };

  types = [
    { name: 'User', ID: 0 },
    { name: 'MList', ID: 1 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
    { name: 'Out of date', ID: 2 },
    { name: 'Deleted', ID: 3 },
  ]

  async componentDidMount() {
    const { fetch, fetchRoles } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3]);
    fetchRoles()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));

    this.setState(this.getStateOverwrite(user));
  }

  getStateOverwrite(user) {
    const properties = {
      ...user.properties,
    };
    const username = user.username.slice(0, user.username.indexOf('@'));
    const roles = (user.roles && user.roles.map(role => role.ID)) || [];
    const storagequotalimit = properties.storagequotalimit;
    let sizeUnit = 1;
    // Covert to biggest possible sizeUnit
    if(storagequotalimit % 1073741824 === 0) {
      properties.storagequotalimit = storagequotalimit / 1073741824;
      sizeUnit = 3;
    } else if (storagequotalimit % 1048576 === 0) {
      properties.storagequotalimit = storagequotalimit / 1048576;
      sizeUnit = 2;
    } else {
      properties.storagequotalimit = storagequotalimit / 1024;
    }
    return {
      sizeUnit,
      user: {
        ...user,
        username,
        roles,
        properties,
      },
    };
  }

  handleInput = field => event => {
    this.setState({
      user: {
        ...this.state.user,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handlePropertyChange = field => event => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.value,
        },
      },
      unsaved: true,
    });
  }

  handleIntPropertyChange = field => event => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: parseInt(event.target.value) || '',
        },
      },
      unsaved: true,
    });
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      user: {
        ...this.state.user,
        [field]: input,
      },
    });
  }

  handleEdit = () => {
    const { user } = this.state;
    this.props.edit(this.props.domain.ID, {
      ...user,
      aliases: user.aliases.filter(alias => alias !== ''),
      properties: {
        ...user.properties,
        storagequotalimit: user.properties.storagequotalimit * Math.pow(2, 10 * this.state.sizeUnit),
      },
      roles: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleSync = () => {
    const { sync, domain } = this.props;
    const { user } = this.state;
    sync(domain.ID, user.ID)
      .then(user => 
        this.setState({
          ...this.getStateOverwrite(user),
          snackbar: 'Success!',
        })
      )
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handlePasswordChange = async () => {
    const { user, newPw } = this.state;
    await changeUserPassword(this.props.domain.ID, user.ID, newPw)
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg.message || 'Unknown error' }));
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  handleMultiSelect = event => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(parseInt(options[i].value));
      }
    }
    this.setState({
      user: {
        ...this.state.user,
        roles: value,
      },
    });
  };

  handleSaveRoles = () => {
    const { editUserRoles, domain } = this.props;
    const { ID, roles } = this.state.user;
    editUserRoles(domain.ID, ID, { roles: roles })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleTabChange = (e, tab) => this.setState({ tab });

  handleAliasEdit = idx => event => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy[idx] = event.target.value;
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleAddAlias = () => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy.push('');
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleRemoveAlias = idx => () => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy.splice(idx, 1);
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleCheckbox = field => e => this.setState({
    user: {
      ...this.state.user,
      [field]: e.target.checked,
    },
  });

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value });

  handleDetachDialog = detaching => () => this.setState({ detaching });

  handleDetach = () => {
    const { domain, edit } = this.props;
    this.setState({ detachLoading: true });
    edit(domain.ID, { ID: this.state.user.ID, ldapImported: false })
      .then(() => this.setState({
        user: {
          ...this.state.user,
          ldapImported: false,
        },
        snackbar: 'Success!',
        detachLoading: false,
        detaching: false,
      }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error', detachLoading: false }));
  }

  render() {
    const { classes, t, domain, Roles } = this.props;
    const { user, changingPw, newPw, checkPw, snackbar, tab, sizeUnit, detachLoading, detaching } = this.state;
    const { properties, smtp, pop3_imap, publicAddress, ldapImported } = user; //eslint-disable-line
    const { language, title, displayname, nickname, primarytelephonenumber,
      mobiletelephonenumber, streetaddress, comment, creationtime, displaytypeex,
      departmentname, companyname, officelocation, givenname, surname, initials,
      assistant, country, locality, stateorprovince, postalcode, storagequotalimit,
      hometelephonenumber, home2telephonenumber, businesstelephonenumber, business2telephonenumber,
      pagertelephonenumber, primaryfaxnumber, assistanttelephonenumber } = properties;
    const usernameError = user.username && !user.username.match(/^([.0-9a-z_+-]+)$/);

    return (
      <div className={classes.root}>
        <TopBar title={t("Users")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'User' })}
              </Typography>
            </Grid>
            {ldapImported && <Grid container className={classes.syncButtons}>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginRight: 8 }}
                onClick={this.handleDetachDialog(true)}
                size="small"
              >
                <Detach fontSize="small" className={classes.leftIcon} /> Detach
              </Button>
              <Button
                size="small"
                onClick={this.handleSync}
                variant="contained"
                color="primary"
              >
                <Sync fontSize="small" className={classes.leftIcon}/> Sync
              </Button>
            </Grid>}
            <Tabs value={tab} onChange={this.handleTabChange}>
              <Tab label={t("Account")} />
              <Tab label={t("User")} />
              <Tab label={t("Contact")} />
              <Tab label={t("Roles")} />
              <Tab label={t("SMTP")} />
            </Tabs>
            <FormControl className={classes.form}>
              {tab === 0 && <React.Fragment>
                <Grid container className={classes.input}>
                  <TextField 
                    label={t("Username")}
                    value={user.username || ''}
                    autoFocus
                    onChange={this.handleInput('username')}
                    style={{ flex: 1, marginRight: 8 }}
                    InputProps={{
                      endAdornment: <div>@{domain.domainname}</div>,
                    }}
                    error={usernameError}
                  />
                  <Button
                    variant="contained"
                    onClick={() => this.setState({ changingPw: true })}
                    size="small"
                  >
                    {t('Change password')}
                  </Button>
                </Grid>
                <TextField
                  select
                  className={classes.input}
                  label={t("Status")}
                  fullWidth
                  value={user.addressStatus || 0}
                  onChange={this.handleInput('addressStatus')}
                >
                  {this.statuses.map((status, key) => (
                    <MenuItem key={key} value={status.ID}>
                      {status.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  className={classes.input}
                  label={t("Creation time")}
                  fullWidth
                  value={creationtime || ''}
                  onChange={this.handlePropertyChange('creationtime')}
                  disabled
                />
                <TextField 
                  className={classes.input} 
                  label={t("Storage quota limit")}
                  fullWidth 
                  value={storagequotalimit || ''}
                  onChange={this.handleIntPropertyChange('storagequotalimit')}
                  InputProps={{
                    endAdornment:
                      <FormControl>
                        <Select
                          onChange={this.handleUnitChange}
                          value={sizeUnit}
                          className={classes.select}
                        >
                          <MenuItem value={1}>MiB</MenuItem>
                          <MenuItem value={2}>GiB</MenuItem>
                          <MenuItem value={3}>TiB</MenuItem>
                        </Select>
                      </FormControl>,
                  }}
                />
                <TextField
                  select
                  className={classes.input}
                  label={t("Type")}
                  fullWidth
                  disabled={displaytypeex === 1}
                  value={displaytypeex || 0}
                  onChange={this.handlePropertyChange('displaytypeex')}
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
                  label={t("Language")}
                  fullWidth
                  value={language || 'english'}
                  onChange={this.handlePropertyChange('language')}
                >
                  <MenuItem value={'english'}>
                    {t('English')}
                  </MenuItem>
                  <MenuItem value={'german'}>
                    {t('Deutsch')}
                  </MenuItem>
                </TextField>
                <Grid container className={classes.input}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={smtp || false }
                        onChange={this.handleCheckbox('smtp')}
                        color="primary"
                      />
                    }
                    label={t('Smtp')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={publicAddress || false }
                        onChange={this.handleCheckbox('publicAddress')}
                        color="primary"
                      />
                    }
                    label={t('Public address')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pop3_imap || false /*eslint-disable-line*/}
                        onChange={this.handleCheckbox('pop3_imap')}
                        color="primary"
                      />
                    }
                    label={t('Pop3 imap')}
                  />
                </Grid>
              </React.Fragment>}

              {tab === 1 && <React.Fragment>
                <Typography variant="h6" className={classes.headline}>{t('Name')}</Typography>
                <Grid container>
                  <Grid item xs={12} className={classes.gridItem}>
                    <div className={classes.grid}>
                      <TextField 
                        className={classes.flexTextfield}
                        label={t("First name")}
                        value={givenname || ''}
                        onChange={this.handlePropertyChange('givenname')}
                      />
                      <TextField 
                        //className={classes.flexTextfield}
                        label={t("Initials")}
                        value={initials || ''}
                        onChange={this.handlePropertyChange('initials')}
                      />
                    </div>
                    <TextField 
                      className={classes.propertyInput} 
                      label={t("Surname")} 
                      fullWidth 
                      value={surname || ''}
                      onChange={this.handlePropertyChange('surname')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.propertyInput}
                      label={t("Display name")}
                      fullWidth
                      value={displayname || ''}
                      onChange={this.handlePropertyChange('displayname')}
                    />
                    <TextField 
                      className={classes.propertyInput} 
                      label={t("Nickname")} 
                      fullWidth 
                      value={nickname || ''}
                      onChange={this.handlePropertyChange('nickname')}
                    />
                  </Grid>
                </Grid>
                <Divider className={classes.divider} />
                <Grid container>
                  <Grid item xs={6}>
                    <TextField 
                      className={classes.address}
                      label={t("Address")}
                      variant="outlined"
                      fullWidth
                      value={streetaddress || ''}
                      onChange={this.handlePropertyChange('streetaddress')}
                      multiline
                      rows={3}
                      inputProps={{
                        className: classes.textarea,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      className={classes.input}
                      label={t("Position")}
                      fullWidth
                      value={title || ''}
                      onChange={this.handlePropertyChange('title')}
                    />
                    <TextField 
                      className={classes.input}
                      label={t("Company")}
                      fullWidth
                      value={companyname || ''}
                      onChange={this.handlePropertyChange('companyname')}
                    />
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.propertyInput}
                      label={t("Locality")}
                      fullWidth
                      value={locality || ''}
                      onChange={this.handlePropertyChange('locality')}
                    />
                    <TextField 
                      className={classes.propertyInput}
                      label={t("Department")}
                      fullWidth
                      value={departmentname || ''}
                      onChange={this.handlePropertyChange('departmentname')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.propertyInput}
                      label={t("State")}
                      fullWidth
                      value={stateorprovince || ''}
                      onChange={this.handlePropertyChange('stateorprovince')}
                    />
                    <TextField 
                      className={classes.propertyInput}
                      label={t("Office")}
                      fullWidth
                      value={officelocation || ''}
                      onChange={this.handlePropertyChange('officelocation')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.propertyInput}
                      label={t("Postal Code")}
                      fullWidth
                      value={postalcode || ''}
                      onChange={this.handlePropertyChange('postalcode')}
                    />
                    <TextField 
                      className={classes.propertyInput}
                      label={t("Assistant")}
                      fullWidth
                      value={assistant || ''}
                      onChange={this.handlePropertyChange('assistant')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <FormControl className={classes.propertyInput}>
                      <InputLabel>{t("Country")}</InputLabel>
                      <Select
                        value={country || "Germany"}
                        onChange={this.handlePropertyChange('country')}
                        fullWidth
                        native
                      >
                        {world.map(country =>
                          <option key={country.id} value={country.name}>
                            {country.name}
                          </option>  
                        )}
                      </Select>
                    </FormControl>
                    <TextField 
                      className={classes.propertyInput} 
                      label={t("Telephone")} 
                      fullWidth 
                      value={primarytelephonenumber || ''}
                      onChange={this.handlePropertyChange('primarytelephonenumber')}
                    />
                  </Grid>
                </Grid>
              </React.Fragment>}
              {tab === 2 && <React.Fragment>
                <Typography variant="h6" className={classes.headline}>{t('Telephone')}</Typography>
                <Grid container>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.input} 
                      label={t("Business 1")} 
                      fullWidth 
                      value={businesstelephonenumber || ''}
                      onChange={this.handlePropertyChange('businesstelephonenumber')}
                    />
                    <TextField 
                      className={classes.input} 
                      label={t("Privat 1")} 
                      fullWidth 
                      value={hometelephonenumber || ''}
                      onChange={this.handlePropertyChange('hometelephonenumber')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.input} 
                      label={t("Business 2")} 
                      fullWidth 
                      value={business2telephonenumber || ''}
                      onChange={this.handlePropertyChange('business2telephonenumber')}
                    />
                    <TextField 
                      className={classes.input} 
                      label={t("Privat 2")} 
                      fullWidth 
                      value={home2telephonenumber || ''}
                      onChange={this.handlePropertyChange('home2telephonenumber')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.input} 
                      label={t("Fax")} 
                      fullWidth 
                      value={primaryfaxnumber || ''}
                      onChange={this.handlePropertyChange('primaryfaxnumber')}
                    />
                    <TextField 
                      className={classes.input} 
                      label={t("Mobile")} 
                      fullWidth 
                      value={mobiletelephonenumber || ''}
                      onChange={this.handlePropertyChange('mobiletelephonenumber')}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem}>
                    <TextField 
                      className={classes.input} 
                      label={t("Assistant")} 
                      fullWidth 
                      value={assistanttelephonenumber || ''}
                      onChange={this.handlePropertyChange('assistanttelephonenumber')}
                    />
                    <TextField 
                      className={classes.input} 
                      label={t("Pager")} 
                      fullWidth 
                      value={pagertelephonenumber || ''}
                      onChange={this.handlePropertyChange('pagertelephonenumber')}
                    />
                  </Grid>
                </Grid>
                <Divider className={classes.divider}/>
                <Typography variant="h6" className={classes.headline}>{t('Annotation')}</Typography>
                <TextField 
                  className={classes.input}
                  fullWidth
                  value={comment || ''}
                  onChange={this.handlePropertyChange('comment')}
                  multiline
                  rows={4}
                />
              </React.Fragment>}

              {tab === 3 && <React.Fragment>
                <Typography variant="h6" className={classes.headline}>{t('Roles')}</Typography>
                <FormControl className={classes.input}>
                  <Select
                    multiple
                    fullWidth
                    value={user.roles || []}
                    onChange={this.handleMultiSelect}
                    native
                  >
                    {(Roles || []).map((role, key) => (
                      <option
                        key={key}
                        value={role.ID}
                      >
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </React.Fragment>}
              {tab === 4 && <React.Fragment>
                <Typography variant="h6" className={classes.headline}>{t('E-Mail Addresses')}</Typography>
                <List className={classes.list}>
                  {user.aliases.map((alias, idx) => <ListItem key={idx} className={classes.listItem}>
                    <TextField
                      className={classes.listTextfield}
                      value={alias}
                      label={'Alias ' + (idx + 1)}
                      onChange={this.handleAliasEdit(idx)}
                    />
                    <IconButton onClick={this.handleRemoveAlias(idx)}>
                      <Close color="error" />
                    </IconButton>
                  </ListItem>
                  )}
                </List>
                <Grid container justify="center">
                  <Button onClick={this.handleAddAlias}>{t('addHeadline', { item: 'E-Mail' })}</Button>
                </Grid>
              </React.Fragment>
              }
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            {[0, 1, 2, 4].includes(tab) ? <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
              disabled={!user.username || usernameError}
            >
              {t('Save')}
            </Button> :
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSaveRoles}
              >
                {t('Save')}
              </Button>}
          </Paper>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </div>
        <DetachDialog
          open={detaching}
          loading={detachLoading}
          onClose={this.handleDetachDialog(false)}
          onDetach={this.handleDetach}
        />
        <Dialog open={!!changingPw}>
          <DialogTitle>{t('Change password')}</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={({ target }) => this.setState({ newPw: target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat new password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={({ target }) => this.setState({ checkPw: target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ changingPw: false })}>
              {t('Cancel')}
            </Button>
            <Button
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  Roles: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  sync: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  editUserRoles: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Roles: state.roles.Roles || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID))
      .then(user => user)
      .catch(msg => Promise.reject(msg)),
    fetchRoles: async () => {
      await dispatch(fetchRolesData({ sort: 'name,asc' })).catch(msg => Promise.reject(msg));
    },
    edit: async (domainID, user) => {
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
    editUserRoles: async (domainID, userID, roles) => {
      await dispatch(editUserRoles(domainID, userID, roles)).catch(msg => Promise.reject(msg));
    },
    sync: async (domainID, userID) =>
      await dispatch(syncLdapData(domainID, userID))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserDetails)));
