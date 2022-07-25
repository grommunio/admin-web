// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import Search from '@mui/icons-material/Search';
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
import logo from '../res/grommunio_logo_light.svg';
import blue from '../colors/blue';
import { Grid, Tabs, Tab, TextField, InputAdornment, Typography } from '@mui/material';
import image from '../res/bootback-dark.svg';
import { selectDrawerDomain } from '../actions/drawer';
import { BackupTable, Dns, QueryBuilder, TableChart, TaskAlt } from '@mui/icons-material';
import { SYSTEM_ADMIN_READ } from '../constants';

const styles = theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2, 0, 2),
    ...theme.mixins.toolbar,
    justifyContent: 'center',
    height: 68,
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
    '&.Mui-selected': {
      background: `linear-gradient(90deg, ${blue['400']}, #2d323b)`,
      color: '#fff',
      '&:hover': {
      },
    },
  },
  icon: {
    fontSize: '24px',
    lineHeight: '30px',
    float: 'left',
    marginTop: '2px',
    marginRight: '15px',
    textAlign: 'center',
    verticalAlign: 'middle',
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
  background: {
    position: 'absolute',
    zIndex: '-1',
    height: '100%',
    width: '100%',
    display: "block",
    top: '0',
    left: '0',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundImage: 'url(' + image + ')',
    opacity: '0', // deactivated background Image
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
});

class NavigationLinks extends PureComponent {

  state = {
    tab: 0,
    filter: '',
    defaultsIn: false,
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

  render() {
    const { classes, t, expandedDomain, location, domains, capabilities } = this.props;
    const { filter, tab } = this.state;
    const isSysAdmin = capabilities.includes(SYSTEM_ADMIN_READ);
    const pathname = location.pathname;
    return(
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <img
            src={logo}
            width="140"
            height="32"
            alt="grommunio"
            onClick={this.handleNavigation('')}
            className={classes.logo}
          />
        </div>
        {isSysAdmin && <Tabs
          onChange={(event, tab) => this.setState({ tab: tab })}
          value={tab}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab className={classes.tab} value={0} label={t('Admin')} />
          <Tab className={classes.tab} value={1} label={t('Domains')} />
        </Tabs>}
        {(tab === 1 || !isSysAdmin) &&
            <Grid container component="form" autoComplete="off">
              <TextField
                variant="outlined"
                label={t('Search')}
                value={filter}
                onChange={this.handleTextInput}
                InputLabelProps={{
                  classes: {
                    root: classes.input,
                  },
                  shrink: true,
                }}
                InputProps={{
                  classes: { root: classes.input },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="secondary" />
                    </InputAdornment>
                  ),
                }}
                color="primary"
                className={classes.textfield}
              />
            </Grid>}
        <List className={classes.list}>
          {(tab === 1 || !isSysAdmin) &&
            domains.map(({ domainname: name, ID, domainStatus }) => {
              return name.includes(filter) ?
                <React.Fragment key={name}>
                  <ListItem
                    onClick={this.handleDrawer(ID)}
                    button
                    className={classes.li}
                    selected={expandedDomain === ID && pathname === '/' + ID}
                  >
                    <Grid container alignItems="center">
                      <Domains className={classes.icon} />
                      <ListItemText primary={name + (domainStatus === 3 ? ` [${t('Deactivated')}]` : '')} />
                    </Grid>
                  </ListItem>
                  <Collapse in={expandedDomain === ID} unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/users')}
                        selected={expandedDomain === ID &&
                          pathname.startsWith('/' + ID + '/users')}
                      >
                        <Grid container alignItems="center">
                          <People className={classes.nestedIcon}/>
                          <ListItemText primary={t('Users')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/folders')}
                        selected={expandedDomain === ID &&
                          pathname.startsWith('/' + ID + '/folders')}
                      >
                        <Grid container alignItems="center">
                          <Folder className={classes.nestedIcon}/>
                          <ListItemText primary={t('Public folders')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/classes')}
                        selected={pathname.startsWith('/' + ID + '/classes')}
                      >
                        <Grid container alignItems="center">
                          <Classes className={classes.nestedIcon}/>
                          <ListItemText primary={t('Groups')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/mailLists')}
                        selected={pathname.startsWith('/' + ID + '/mailLists')}
                      >
                        <Grid container alignItems="center">
                          <MLists className={classes.nestedIcon}/>
                          <ListItemText primary={t('Mail lists')}/>
                        </Grid>
                      </ListItem>
                    </List>
                  </Collapse>
                </React.Fragment> : null;
            })}
          {(tab === 0 && !isSysAdmin) && <ListItem
            button
            onClick={this.handleNavigation('taskq')}
            className={classes.li}
            selected={pathname.startsWith('/taskq')}
          >
            <Grid container alignItems="center">
              <TaskAlt className={classes.icon}/>
              <ListItemText primary={t('Task queue')} />
            </Grid>
          </ListItem>}
          {tab === 0 && isSysAdmin && <React.Fragment>
            <Typography variant="inherit" className={classes.subheader}>{t('Overview')}</Typography>
            <ListItem
              button
              onClick={this.handleNavigation('')}
              className={classes.li}
              selected={pathname === '/'}
            >
              <Grid container alignItems="center">
                <Dashboard className={classes.icon} />
                <ListItemText primary="Dashboard"/>
              </Grid>
            </ListItem>
            <Typography variant="inherit" className={classes.subheader}>{t('Management')}</Typography>
            <ListItem
              className={classes.li}
              button
              onClick={this.handleNavigation('orgs')}
              selected={pathname.startsWith('/orgs')}
            >
              <Grid container alignItems="center">
                <Orgs className={classes.icon}/>
                <ListItemText primary={t('Organizations')}/>
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('domains')}
              className={classes.li}
              selected={pathname.startsWith('/domains')}
            >
              <Grid container alignItems="center">
                <Domains className={classes.icon}/>
                <ListItemText primary={t('Domains')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('users')}
              className={classes.li}
              selected={pathname.startsWith('/users')}
            >
              <Grid container alignItems="center">
                <People className={classes.icon}/>
                <ListItemText primary={t('Users')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('roles')}
              className={classes.li}
              selected={pathname === '/roles'}
            >
              <Grid container alignItems="center">
                <Roles className={classes.icon}/>
                <ListItemText primary={t('Roles')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('defaults')}
              className={classes.li}
              selected={pathname === '/defaults'}
            >
              <Grid container alignItems="center">
                <BackupTable className={classes.icon}/>
                <ListItemText primary={t('Defaults')} />
              </Grid>
            </ListItem>
            <Typography variant="inherit" className={classes.subheader}>{t('Configuration')}</Typography>
            <ListItem
              button
              onClick={this.handleNavigation('directory')}
              className={classes.li}
              selected={pathname === '/directory'}
            >
              <Grid container alignItems="center">
                <Ldap className={classes.icon}/>
                <ListItemText primary={t('LDAP Directory')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('dbconf')}
              className={classes.li}
              selected={pathname.startsWith('/dbconf')}
            >
              <Grid container alignItems="center">
                <Storage className={classes.icon}/>
                <ListItemText primary={t('Configuration DB')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('servers')}
              className={classes.li}
              selected={pathname.startsWith('/servers')}
            >
              <Grid container alignItems="center">
                <Dns className={classes.icon}/>
                <ListItemText primary={t('Servers')} />
              </Grid>
            </ListItem>
            <Typography variant="inherit" className={classes.subheader}>{t('Monitoring')}</Typography>
            <ListItem
              button
              onClick={this.handleNavigation('logs')}
              className={classes.li}
              selected={pathname.startsWith('/logs')}
            >
              <Grid container alignItems="center">
                <Logs className={classes.icon}/>
                <ListItemText primary={t('Logs')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('mailq')}
              className={classes.li}
              selected={pathname.startsWith('/mailq')}
            >
              <Grid container alignItems="center">
                <QueryBuilder className={classes.icon}/>
                <ListItemText primary={t('Mail queue')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('taskq')}
              className={classes.li}
              selected={pathname.startsWith('/taskq')}
            >
              <Grid container alignItems="center">
                <TaskAlt className={classes.icon}/>
                <ListItemText primary={t('Task queue')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('sync')}
              className={classes.li}
              selected={pathname.startsWith('/sync')}
            >
              <Grid container alignItems="center">
                <Sync className={classes.icon}/>
                <ListItemText primary={t('Mobile devices')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('status')}
              className={classes.li}
              selected={pathname.startsWith('/status')}
            >
              <Grid container alignItems="center">
                <TableChart className={classes.icon}/>
                <ListItemText primary={t('Live status')} />
              </Grid>
            </ListItem>
          </React.Fragment>
          }
        </List>
        <div className={classes.background} />
      </React.Fragment>
    );
  }
}

NavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.array,
  capabilities: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  expandedDomain: PropTypes.number,
  selectDomain: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    capabilities: state.auth.capabilities,
    expandedDomain: state.drawer.selectedDomain,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectDomain: id => dispatch(selectDrawerDomain(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(NavigationLinks))));
