// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import Dashboard from '@mui/icons-material/Dashboard';
import People from '@mui/icons-material/People';
import Domains from '@mui/icons-material/Domain';
import Folder from '@mui/icons-material/Folder';
import Ldap from '@mui/icons-material/Contacts';
import MLists from '@mui/icons-material/Email';
import Storage from '@mui/icons-material/Storage';
import Orgs from '@mui/icons-material/GroupWork';
import Logs from '@mui/icons-material/ViewHeadline';
import Sync from '@mui/icons-material/Sync';
import Classes from '@mui/icons-material/Class';
import Roles from '@mui/icons-material/VerifiedUser';
import grey from '../colors/grey';
import logo from '../res/grommunio_icon_light.svg';
import { IconButton, Tooltip, Avatar } from '@mui/material';
import { selectDrawerDomain, setDrawerExpansion } from '../actions/drawer';
import { Add, AdminPanelSettings, BackupTable, Dns, QueryBuilder, TableChart, TaskAlt } from '@mui/icons-material';
import { SYSTEM_ADMIN_READ } from '../constants';
import Feedback from './Feedback';
import AddDomain from './Dialogs/AddDomain';

const styles = theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2, 0, 2),
    ...theme.mixins.toolbar,
    justifyContent: 'center',
    height: 64,
  },
  dashboard: {
    '&:hover': {
      backgroundColor: `${grey['900']}`, 
    },
    flex: 1,
  },
  nested: {
    paddingLeft: 30,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  li: {
    width: 'auto',
    margin: '6px 12px 6px',
    borderRadius: '3px',
    position: 'relative',
    display: 'flex',
    padding: '9px 14px',
    transition: 'all 200ms linear',
    '&:hover': {
      backgroundColor: 'transparent',
      textShadow: '0px 0px 1px white',
      color: 'white',
    },
  },
  icon: {
    float: 'left',
    textAlign: 'center',
    verticalAlign: 'middle',
    transition: 'all 200ms linear',
    color: '#e6e6e6',
    '&:hover': {
      backgroundColor: 'transparent',
      textShadow: '0px 0px 1px white',
      color: 'white',
    },
  },
  nestedIcon: {
    float: 'left',
    paddingLeft: 16,
    paddingRight: 6,
  },
  tabs: {
    width: 260,
    minWidth: 260,
    marginLeft: 8,
    color: '#333',
  },
  tab: {
    width: 122,
    minWidth: 122,
    color: '#ccc',
  },
  logo: {
    cursor: 'pointer',
  },
  input: {
    color: 'white',
  },
  textfield: {
    margin: theme.spacing(1, 1, 1, 1),
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  subheader: {
    margin: theme.spacing(2, 0, 0, 1),
    fontWeight: 600,
  },
  addButton: {
    margin: '0 8px',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
  }
});

class RetractedNavigationLinks extends PureComponent {

  state = {
    filter: '',
    defaultsIn: false,
    adding: false,
    snackbar: '',
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleDrawer = domain => event => {
    event.preventDefault();
    this.props.selectDomain(domain);
    this.props.history.push(`/${domain}`);
  }

  handleTextInput = event => {
    this.setState({ filter: event.target.value });
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

  handleAddingError = (error) => this.setState({ snackbar: error });

  toggleTab = () => {
    const { tab, setTab } = this.props;
    setTab(tab === 0 ? 1 : 0);
  }

  render() {
    const { classes, t, expandedDomain, location, domains, capabilities, tab, config } = this.props;
    const { filter, adding, snackbar } = this.state;
    const isSysAdmin = capabilities.includes(SYSTEM_ADMIN_READ);
    const pathname = location.pathname;
    return(
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <img
            src={config.customImages[window.location.hostname]?.icon || logo}
            height="32"
            alt="g"
            onClick={this.handleNavigation('')}
            className={classes.logo}
          />
        </div>
        {isSysAdmin && <div className={classes.flexCenter}>
          <Tooltip title={t('Toggle admin panel')} placement="right" arrow>
            <IconButton onClick={this.toggleTab}>
              <AdminPanelSettings color="inherit" fontSize='large' className={classes.icon}/>
            </IconButton>
          </Tooltip>
        </div>}
        <List className={classes.list}>
          {tab === 1 && isSysAdmin && <div className={classes.flexCenter}>
            <IconButton
              color="primary"
              onClick={this.handleAdd}
              className={classes.addButton}
            >
              <Add fontSize='large'/>
            </IconButton>
          </div>}
          {(tab === 1 || !isSysAdmin) &&
            domains.map(({ domainname: name, ID, domainStatus }) => {
              return name.includes(filter) ?
                <React.Fragment key={name}>
                  <Tooltip  placement="right" title={name + (domainStatus === 3 ? ` [${t('Deactivated')}]` : '')}>
                    <ListItem
                      onClick={this.handleDrawer(ID)}
                      button
                      className={classes.flexCenter}
                      selected={expandedDomain === ID && pathname === '/' + ID}
                    >
                      <Avatar>
                        {name[0]}
                      </Avatar>
                    </ListItem>
                  </Tooltip>
                  <Collapse in={expandedDomain === ID} unmountOnExit>
                    <List component="div" disablePadding>
                      <Tooltip placement="right" title={t('Users')}>
                        <ListItem
                          className={classes.flexCenter}
                          button
                          onClick={this.handleNavigation(ID + '/users')}
                          selected={expandedDomain === ID &&
                            pathname.startsWith('/' + ID + '/users')}
                        >
                          <People fontSize='large' className={classes.icon}/>
                        </ListItem>
                      </Tooltip>
                      <Tooltip placement="right" title={t('Folders')}>
                        <ListItem
                          className={classes.flexCenter}
                          button
                          onClick={this.handleNavigation(ID + '/folders')}
                          selected={expandedDomain === ID &&
                            pathname.startsWith('/' + ID + '/folders')}
                        >
                          <Folder fontSize='large' className={classes.icon}/>
                        </ListItem>
                      </Tooltip>
                      <Tooltip placement="right" title={t('Groups')}>
                        <ListItem
                          className={classes.flexCenter}
                          button
                          onClick={this.handleNavigation(ID + '/classes')}
                          selected={pathname.startsWith('/' + ID + '/classes')}
                        >
                          <Classes fontSize='large' className={classes.icon}/>
                        </ListItem>
                      </Tooltip>
                      <Tooltip placement="right" title={t('Groups')}>
                        <ListItem
                          className={classes.flexCenter}
                          button
                          onClick={this.handleNavigation(ID + '/mailLists')}
                          selected={pathname.startsWith('/' + ID + '/mailLists')}
                        >
                          <MLists fontSize='large' className={classes.icon}/>
                        </ListItem>
                      </Tooltip>
                    </List>
                  </Collapse>
                </React.Fragment> : null;
            })}
          {(tab === 0 && !isSysAdmin) && <Tooltip  placement="right" title={t('Task queue')}>
            <ListItem
              button
              onClick={this.handleNavigation('taskq')}
              className={classes.flexCenter}
              selected={pathname.startsWith('/taskq')}
            >
              <TaskAlt fontSize='large' className={classes.icon}/>
            </ListItem>
          </Tooltip>}
          {tab === 0 && isSysAdmin && <React.Fragment>
            <Tooltip placement="right" title={t('Dashboard')}>
              <ListItem
                button
                onClick={this.handleNavigation('')}
                selected={pathname === '/'}
                className={classes.flexCenter}
              >
                <Dashboard fontSize='large' className={classes.icon} />
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Organizations')}>
              <ListItem
                className={classes.flexCenter}
                button
                onClick={this.handleNavigation('orgs')}
                selected={pathname.startsWith('/orgs')}
              >
                <Orgs fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Domains')}>
              <ListItem
                button
                onClick={this.handleNavigation('domains')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/domains')}
              >
                <Domains fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Users')}>
              <ListItem
                button
                onClick={this.handleNavigation('users')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/users')}
              >
                <People fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Roles')}>
              <ListItem
                button
                onClick={this.handleNavigation('roles')}
                className={classes.flexCenter}
                selected={pathname === '/roles'}
              >
                <Roles fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Defaults')}>
              <ListItem
                button
                onClick={this.handleNavigation('defaults')}
                className={classes.flexCenter}
                selected={pathname === '/defaults'}
              >
                <BackupTable fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('LDAP Directory')}>
              <ListItem
                button
                onClick={this.handleNavigation('directory')}
                className={classes.flexCenter}
                selected={pathname === '/directory'}
              >
                <Ldap fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Configuration DB')}>
              <ListItem
                button
                onClick={this.handleNavigation('dbconf')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/dbconf')}
              >
                <Storage fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Servers')}>
              <ListItem
                button
                onClick={this.handleNavigation('servers')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/servers')}
              >
                <Dns fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Logging')}>
              <ListItem
                button
                onClick={this.handleNavigation('logs')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/logs')}
              >
                <Logs fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Mail queue')}>
              <ListItem
                button
                onClick={this.handleNavigation('mailq')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/mailq')}
              >
                <QueryBuilder fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Task queue')}>
              <ListItem
                button
                onClick={this.handleNavigation('taskq')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/taskq')}
              >
                <TaskAlt fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Mobile devices')}>
              <ListItem
                button
                onClick={this.handleNavigation('sync')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/sync')}
              >
                <Sync fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
            <Tooltip placement="right" title={t('Live status')}>
              <ListItem
                button
                onClick={this.handleNavigation('status')}
                className={classes.flexCenter}
                selected={pathname.startsWith('/status')}
              >
                <TableChart fontSize='large' className={classes.icon}/>
              </ListItem>
            </Tooltip>
          </React.Fragment>
          }
        </List>
        <AddDomain
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onClose={this.handleAddingClose}
        />
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: "" })}
        />
      </React.Fragment>
    );
  }
}

RetractedNavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.array,
  capabilities: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  expandedDomain: PropTypes.number,
  selectDomain: PropTypes.func.isRequired,
  toggleExpansion: PropTypes.func.isRequired,
  tab: PropTypes.number.isRequired,
  setTab: PropTypes.func.isRequired,
  config:  PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { auth, drawer, config } = state;
  return {
    capabilities: auth.capabilities,
    expandedDomain: drawer.selectedDomain,
    config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectDomain: id => dispatch(selectDrawerDomain(id)),
    toggleExpansion: () => dispatch(setDrawerExpansion())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(RetractedNavigationLinks))));
