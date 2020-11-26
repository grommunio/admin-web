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
  InputLabel, Input, Tabs, Tab, List, ListItem, IconButton,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles } from '../actions/users';
import TopBar from '../components/TopBar';
import { changeUserPassword } from '../api';
import { fetchRolesData } from '../actions/roles';
import Alert from '@material-ui/lab/Alert';
import Close from '@material-ui/icons/Close';

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
  gird: {
    display: 'flex',
  },
  select: {
    minWidth: 60,
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
    this.setState({
      user: {
        ...this.state.user,
        roles: event.target.value,
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
      mobiletelephonenumber, postaladdress, comment, creationtime, displaytypeex } = user.properties;

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
              <Tab label="System info" />
              <Tab label="User info" />
              <Tab label="Roles" />
              <Tab label="Aliases" />
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
              </React.Fragment>}
              {tab === 1 && <React.Fragment>
                <TextField 
                  className={classes.input}
                  label={t("Display name")}
                  fullWidth
                  value={displayname || ''}
                  onChange={this.handlePropertyChange('displayname')}
                />
                <TextField 
                  className={classes.input}
                  label={t("Job title")}
                  fullWidth
                  value={title || ''}
                  onChange={this.handlePropertyChange('title')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Nickname")} 
                  fullWidth 
                  value={nickname || ''}
                  onChange={this.handlePropertyChange('nickname')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Telephone")} 
                  fullWidth 
                  value={primarytelephonenumber || ''}
                  onChange={this.handlePropertyChange('primarytelephonenumber')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Mobile phone")} 
                  fullWidth 
                  value={mobiletelephonenumber || ''}
                  onChange={this.handlePropertyChange('mobiletelephonenumber')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Home address")} 
                  fullWidth 
                  value={postaladdress || ''}
                  onChange={this.handlePropertyChange('postaladdress')}
                />
                <TextField
                  select
                  className={classes.input}
                  label={t("Language")}
                  fullWidth
                  value={language || 0}
                  onChange={this.handlePropertyChange('language')}
                >
                  <MenuItem value={0}>
                    {t('english')}
                  </MenuItem>
                </TextField>
                <TextField 
                  className={classes.input} 
                  label={t("Comment")} 
                  fullWidth
                  value={comment || ''}
                  onChange={this.handlePropertyChange('comment')}
                />
              </React.Fragment>}
              {tab === 2 && <React.Fragment>
                <FormControl className={classes.input}>
                  <InputLabel id="demo-mutiple-chip-label">{t('Roles')}</InputLabel>
                  <Select
                    labelId="demo-mutiple-chip-label"
                    id="demo-mutiple-chip"
                    multiple
                    fullWidth
                    value={user.roles || []}
                    onChange={this.handleMultiSelect}
                    input={<Input id="select-multiple-chip" />}
                  >
                    {(Roles || []).map((Role, key) => (
                      <MenuItem
                        selected={user.roles.find(role => role === Role.ID)}
                        key={key}
                        value={Role.ID}
                      >
                        {Role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </React.Fragment>}
              {tab === 3 && <React.Fragment>
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
            {[0, 1, 3].includes(tab) ? <Button
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