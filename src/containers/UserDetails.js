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
  InputLabel, Tabs, Tab, List, ListItem, IconButton, Divider,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles } from '../actions/users';
import TopBar from '../components/TopBar';
import { changeUserPassword } from '../api';
import { fetchRolesData } from '../actions/roles';
import Alert from '@material-ui/lab/Alert';
import Close from '@material-ui/icons/Close';
import world from '../res/world.json';

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
  grid: {
    display: 'flex',
    marginBottom: theme.spacing(2),
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
    this.setState({
      user: {
        ...user,
        username: user.username.slice(0, user.username.indexOf('@')),
        roles: (user.roles && user.roles.map(role => role.ID)) || [],
        properties: this.toObject(user.properties),
      },
    });
  }

  toObject(arr) {
    const obj = {};
    arr.forEach(item => obj[item.name] = item.val);
    return obj;
  }

  toArray(obj) {
    const arr = [];
    Object.entries(obj).forEach(([name, val]) => arr.push({ name, val }));
    return arr;
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
      properties: this.toArray(user.properties),
      roles: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
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

  render() {
    const { classes, t, domain, Roles } = this.props;
    const { user, changingPw, newPw, checkPw, snackbar, tab } = this.state;
    const { language, title, displayname, nickname, primarytelephonenumber,
      mobiletelephonenumber, streetaddress, comment, creationtime, displaytypeex,
      departmentname, companyname, officelocation, givenname, surname, initials,
      assistant, country, locality, stateorprovince, postalcode,
      hometelephonenumber, home2telephonenumber, businesstelephonenumber, business2telephonenumber,
      pagertelephonenumber, primaryfaxnumber, assistanttelephonenumber } = user.properties;

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
            <Tabs value={tab} onChange={this.handleTabChange}>
              <Tab label="Account" />
              <Tab label="User" />
              <Tab label="Contact" />
              <Tab label="Roles" />
              <Tab label="SMTP" />
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
              </React.Fragment>}

              {tab === 1 && <React.Fragment>
                <Typography variant="h6" className={classes.headline}>{t('Name')}</Typography>
                <Grid container spacing={6}>
                  <Grid item xs={6}>
                    <Grid container direction="column">
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
                        className={classes.input}
                        label={t("Display name")}
                        fullWidth
                        value={displayname || ''}
                        onChange={this.handlePropertyChange('displayname')}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container direction="column">
                      <TextField 
                        className={classes.input} 
                        label={t("Surname")} 
                        fullWidth 
                        value={surname || ''}
                        onChange={this.handlePropertyChange('surname')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Nickname")} 
                        fullWidth 
                        value={nickname || ''}
                        onChange={this.handlePropertyChange('nickname')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Divider className={classes.divider} />
                <Grid container spacing={6}>
                  <Grid item xs={6}>
                    <Grid container direction="column">
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
                      <TextField 
                        className={classes.input}
                        label={t("Locality")}
                        fullWidth
                        value={locality || ''}
                        onChange={this.handlePropertyChange('locality')}
                      />
                      <TextField 
                        className={classes.input}
                        label={t("State")}
                        fullWidth
                        value={stateorprovince || ''}
                        onChange={this.handlePropertyChange('stateorprovince')}
                      />
                      <TextField 
                        className={classes.input}
                        label={t("Postal Code")}
                        fullWidth
                        value={postalcode || ''}
                        onChange={this.handlePropertyChange('postalcode')}
                      />
                      <FormControl className={classes.input}>
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
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container direction="column">
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
                      <TextField 
                        className={classes.input}
                        label={t("Department")}
                        fullWidth
                        value={departmentname || ''}
                        onChange={this.handlePropertyChange('departmentname')}
                      />
                      <TextField 
                        className={classes.input}
                        label={t("Office")}
                        fullWidth
                        value={officelocation || ''}
                        onChange={this.handlePropertyChange('officelocation')}
                      />
                      <TextField 
                        className={classes.input}
                        label={t("Assistant")}
                        fullWidth
                        value={assistant || ''}
                        onChange={this.handlePropertyChange('assistant')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Telephone")} 
                        fullWidth 
                        value={primarytelephonenumber || ''}
                        onChange={this.handlePropertyChange('primarytelephonenumber')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </React.Fragment>}

              {tab === 2 && <React.Fragment>
                <Typography variant="h6" className={classes.headline}>{t('Telephone')}</Typography>
                <Grid container spacing={6}>
                  <Grid item xs={6}>
                    <Grid container direction="column">
                      <TextField 
                        className={classes.input} 
                        label={t("Business 1")} 
                        fullWidth 
                        value={businesstelephonenumber || ''}
                        onChange={this.handlePropertyChange('businesstelephonenumber')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Business 2")} 
                        fullWidth 
                        value={business2telephonenumber || ''}
                        onChange={this.handlePropertyChange('business2telephonenumber')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Fax")} 
                        fullWidth 
                        value={primaryfaxnumber || ''}
                        onChange={this.handlePropertyChange('primaryfaxnumber')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Assistant")} 
                        fullWidth 
                        value={assistanttelephonenumber || ''}
                        onChange={this.handlePropertyChange('assistanttelephonenumber')}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container direction="column">
                      <TextField 
                        className={classes.input} 
                        label={t("Privat 1")} 
                        fullWidth 
                        value={hometelephonenumber || ''}
                        onChange={this.handlePropertyChange('hometelephonenumber')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Privat 2")} 
                        fullWidth 
                        value={home2telephonenumber || ''}
                        onChange={this.handlePropertyChange('home2telephonenumber')}
                      />
                      <TextField 
                        className={classes.input} 
                        label={t("Mobile")} 
                        fullWidth 
                        value={mobiletelephonenumber || ''}
                        onChange={this.handlePropertyChange('mobiletelephonenumber')}
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
                <FormControl className={classes.input}>
                  <InputLabel id="demo-mutiple-chip-label">{t('Roles')}</InputLabel>
                  <Select
                    labelId="demo-mutiple-chip-label"
                    id="demo-mutiple-chip"
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
                  <Button onClick={this.handleAddAlias}>{t('Add Alias')}</Button>
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
            >
              {('Save')}
            </Button> :
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSaveRoles}
              >
                {('Save')}
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserDetails)));