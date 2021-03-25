// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import Search from '@material-ui/icons/Search';
import Dashboard from '@material-ui/icons/Dashboard';
import People from '@material-ui/icons/People';
import Domains from '@material-ui/icons/Domain';
import Folder from '@material-ui/icons/Folder';
import Ldap from '@material-ui/icons/Contacts';
import MLists from '@material-ui/icons/Email';
import Storage from '@material-ui/icons/Storage';
/*
import Mail from '@material-ui/icons/Mail';
import Orgs from '@material-ui/icons/GroupWork';
import Setup from '@material-ui/icons/SettingsApplicationsOutlined';
import Forwards from '@material-ui/icons/Forward';
import DefaultData from '@material-ui/icons/AccountTree';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
*/
import Groups from '@material-ui/icons/GroupWork';
import Classes from '@material-ui/icons/Class';
import Roles from '@material-ui/icons/VerifiedUser';
import grey from '../colors/grey';
import logo from '../res/grammm_logo_light.svg';
import blue from '../colors/blue';
import { Grid, Tabs, Tab, TextField, InputAdornment } from '@material-ui/core';
import image from '../res/bootback-dark.svg';
import { SYS_ADMIN, DOM_ADMIN } from '../constants';

const styles = theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
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
    margin: theme.spacing(1),
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
});

class NavigationLinks extends PureComponent {

  state = {
    tab: 0,
    expandedDomain: -1,
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
    this.setState({ expandedDomain: domain });
    this.props.history.push(`/${domain}`);
  }

  toggleDefaults = () => this.setState({ defaultsIn: !this.state.defaultsIn });

  handleTextInput = event => {
    this.setState({ filter: event.target.value });
  }

  render() {
    const { classes, t, location, domains, role } = this.props;
    const { filter, expandedDomain, tab } = this.state;

    return(
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <img
            src={logo}
            width="140"
            alt="GRAMMM"
            onClick={this.handleNavigation('')}
            className={classes.logo}
          />
        </div>
        {role === SYS_ADMIN && <Tabs
          onChange={(event, tab) => this.setState({ tab: tab })}
          value={tab}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab className={classes.tab} value={0} label={t('Admin')} />
          <Tab className={classes.tab} value={1} label={t('Domains')} />
        </Tabs>}
        {(tab === 1 || role === DOM_ADMIN) &&
            <Grid container>
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
                      <Search />
                    </InputAdornment>
                  ),
                }}
                color="primary"
                className={classes.textfield}
              />
            </Grid>}
        <List className={classes.list}>
          {(tab === 1 || role === DOM_ADMIN) &&
            domains.map(({ domainname: name, ID, domainStatus }) => {
              return name.includes(filter) ?
                <React.Fragment key={name}>
                  <ListItem
                    onClick={this.handleDrawer(ID)}
                    button
                    className={classes.li}
                    selected={expandedDomain === ID && location.pathname === '/' + ID}
                  >
                    <Grid container alignItems="center">
                      <Domains className={classes.icon} />
                      <ListItemText primary={name + (domainStatus !== 0 ? ` [${t('Deleted')}]` : '')} />
                    </Grid>
                  </ListItem>
                  <Collapse in={expandedDomain === ID} unmountOnExit>
                    <List component="div" disablePadding>
                      {/*<ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/configuration')}
                        selected={stateDomains[ID] &&
                          location.pathname.startsWith('/' + ID + '/configuration')}
                      >
                        <Grid container alignItems="center">
                          <Settings className={classes.nestedIcon}/>
                          <ListItemText primary={t('Configuration')}/>
                        </Grid>
                      </ListItem>*/}
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/users')}
                        selected={expandedDomain === ID &&
                          location.pathname.startsWith('/' + ID + '/users')}
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
                          location.pathname.startsWith('/' + ID + '/folders')}
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
                        selected={location.pathname.startsWith('/' + ID + '/classes')}
                      >
                        <Grid container alignItems="center">
                          <Classes className={classes.nestedIcon}/>
                          <ListItemText primary={t('Classes')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/groups')}
                        selected={location.pathname.startsWith('/' + ID + '/groups')}
                      >
                        <Grid container alignItems="center">
                          <Groups className={classes.nestedIcon}/>
                          <ListItemText primary={t('Groups')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/mailLists')}
                        selected={location.pathname.startsWith('/' + ID + '/mailLists')}
                      >
                        <Grid container alignItems="center">
                          <MLists className={classes.nestedIcon}/>
                          <ListItemText primary={t('Mail lists')}/>
                        </Grid>
                      </ListItem>
                      {/*<ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(ID + '/mailAddresses')}
                        selected={stateDomains[ID] &&
                          location.pathname.startsWith('/' + ID + '/mailAddresses')}
                      >
                        <Grid container alignItems="center">
                          <Mail className={classes.nestedIcon}/>
                          <ListItemText primary={t('Mail addresses')}/>
                        </Grid>
                      </ListItem>*/}
                    </List>
                  </Collapse>
                </React.Fragment> : null;
            })}
          {tab === 0 && role === SYS_ADMIN && <React.Fragment>
            <ListItem
              button
              onClick={this.handleNavigation('')}
              className={classes.li}
              selected={location.pathname === '/'}
            >
              <Grid container alignItems="center">
                <Dashboard className={classes.icon} />
                <ListItemText primary="Dashboard"/>
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('domainList')}
              className={classes.li}
              selected={location.pathname.startsWith('/domainList')}
            >
              <Grid container alignItems="center">
                <Domains className={classes.icon}/>
                <ListItemText primary={t('Domain list')} />
              </Grid>
            </ListItem>  
            {/*<ListItem
              className={classes.li}
              button
              onClick={this.handleNavigation('orgs')}
              selected={location.pathname.startsWith('/orgs')}
            >
              <Grid container alignItems="center">
                <Orgs className={classes.icon}/>
                <ListItemText primary={t('Organizations')}/>
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('baseSetup')}
              className={classes.li}
              selected={location.pathname === '/baseSetup'}
            >
              <Grid container alignItems="center">
                <Setup className={classes.icon}/>
                <ListItemText primary={t('Base setup')} />
              </Grid>
            </ListItem>*/}
            <ListItem
              button
              onClick={this.handleNavigation('roles')}
              className={classes.li}
              selected={location.pathname === '/roles'}
            >
              <Grid container alignItems="center">
                <Roles className={classes.icon}/>
                <ListItemText primary={t('Roles')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('ldap')}
              className={classes.li}
              selected={location.pathname === '/ldap'}
            >
              <Grid container alignItems="center">
                <Ldap className={classes.icon}/>
                <ListItemText primary={t('LDAP')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('dbconf')}
              className={classes.li}
              selected={location.pathname.startsWith('/dbconf')}
            >
              <Grid container alignItems="center">
                <Storage className={classes.icon}/>
                <ListItemText primary={t('DB Configuration')} />
              </Grid>
            </ListItem>
            {/*<ListItem button onClick={this.toggleDefaults} className={classes.li}>
              <DefaultData className={classes.icon} />
              <ListItemText primary={t('Default data')} />
              { defaultsIn ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </ListItem>
            <Collapse in={defaultsIn} unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  className={classes.li}
                  button
                  onClick={this.handleNavigation('groups')}
                  selected={location.pathname.startsWith('/groups')}
                >
                  <Grid container alignItems="center">
                    <People className={classes.nestedIcon}/>
                    <ListItemText primary={t('Groups')}/>
                  </Grid>
                </ListItem>
                <ListItem
                  className={classes.li}
                  button
                  onClick={this.handleNavigation('forwards')}
                  selected={location.pathname.startsWith('/forwards')}
                >
                  <Grid container alignItems="center">
                    <Forwards className={classes.nestedIcon}/>
                    <ListItemText primary={t('Forwards')}/>
                  </Grid>
                </ListItem>
                <ListItem
                  className={classes.li}
                  button
                  onClick={this.handleNavigation('members')}
                  selected={location.pathname.startsWith('/members')}
                >
                  <Grid container alignItems="center">
                    <Members className={classes.nestedIcon}/>
                    <ListItemText primary={t('Members')}/>
                  </Grid>
                </ListItem>       
              </List>
          </Collapse>*/}
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
  role: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    role: state.auth.role,
  };
};

export default connect(mapStateToProps)(
  withRouter(withTranslation()(withStyles(styles)(NavigationLinks))));
