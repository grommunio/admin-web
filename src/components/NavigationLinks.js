import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import DefaultData from '@material-ui/icons/AccountTree';
import Settings from '@material-ui/icons/Settings';
import Setup from '@material-ui/icons/SettingsApplicationsOutlined';
import Dashboard from '@material-ui/icons/Dashboard';
import Run from '@material-ui/icons/DirectionsRun';
import People from '@material-ui/icons/People';
import Lock from '@material-ui/icons/Lock';
import Http from '@material-ui/icons/Http';
import Web from '@material-ui/icons/Web';
import Orgs from '@material-ui/icons/GroupWork';
import Aliases from '@material-ui/icons/AssignmentInd';
import Forwards from '@material-ui/icons/Forward';
import Folder from '@material-ui/icons/Folder';
import Mail from '@material-ui/icons/Mail';
import MLists from '@material-ui/icons/Email';
import Classes from '@material-ui/icons/Class';
import Members from '@material-ui/icons/Contacts';
import { authLogout } from '../actions/auth';
import grey from '../colors/grey';
import logo from '../res/grammm_logo_only.svg';
import blue from '../colors/blue';
import { Grid, Tabs, Tab } from '@material-ui/core';

const styles = theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    ...theme.mixins.toolbar,
    justifyContent: 'center',
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
    display: 'block',
    padding: '9px 14px',
    transition: 'all 350ms linear',
    '&:hover': {
      backgroundColor: `rgba(255, 255, 255, 0.15)`,
    },
    '&.Mui-selected': {
      background: `linear-gradient(30deg, ${blue['700']}, ${blue['500']})`,
      color: 'black',
      '&:hover': {
        background: `linear-gradient(30deg, ${blue['700']}, ${blue['500']})`,
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
  logoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 1,
  },
  logout: {
    flex: 1,
    flexGrow: 0,
  },
  expandIcon: {
    float: 'right',
    marginTop: '2px',
  },
  tabs: {
    width: 260,
    minWidth: 260,
  },
  tab: {
    width: 130,
    minWidth: 130,
  },
});

class NavigationLinks extends PureComponent {

  constructor(props) {
    super(props);
    // Map domains array to bool obj with domains as keys
    const domains = this.props.domains.map(obj => obj.name)
      .reduce((a, b) => (a[b] = false, a), {});//eslint-disable-line
    this.listRef = React.createRef();
    this.state = {
      tab: 0,
      stateDomains: domains,
      filter: '',
      defaultsIn: false,
    };
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleLogout = () => {
    const { history, authLogout } = this.props;
    history.push('/');
    authLogout();
  }

  handleDrawer = domain => event => {
    event.preventDefault();
    let overwrite = {};
    for (const key in this.state) {
      overwrite[key] = false;
    }
    overwrite[domain] = !this.state[domain]
      || this.props.location.pathname !== '/' + domain;
    this.setState({ stateDomains: { ...overwrite } });
    this.props.history.push(`/${domain}`);
  }

  toggleDefaults = () => this.setState({ defaultsIn: !this.state.defaultsIn });

  render() {
    const { classes, t, location, domains } = this.props;
    const { filter, stateDomains, defaultsIn } = this.state;

    return(
      <React.Fragment>
        <List className={classes.list} ref={this.listRef}>
          <div className={classes.drawerHeader}>
            <Button
              variant="text"
              color="primary"
              onClick={this.handleNavigation('')}
              className={classes.dashboard}
            >
              <img src={logo} width="80" alt="GRAMMM"/>
            </Button>
          </div>
          <Tabs
            variant="fullWidth"
            onChange={(event, tab) => this.setState({ tab: tab })}
            value={this.state.tab}
            className={classes.tabs}
          >
            <Tab className={classes.tab} value={0} label={t('Admin')} />
            <Tab className={classes.tab} value={1} label={t('Domains')} />
          </Tabs>
          {this.state.tab === 1 && 
            domains.map(({ domainname: name }) => {
              return name.includes(filter) ?
                <React.Fragment key={name}>
                  <ListItem
                    onClick={this.handleDrawer(name)}
                    button
                    className={classes.li}
                    selected={stateDomains[name] && location.pathname === '/' + name}
                  >
                    <Grid container alignItems="center">
                      <Http className={classes.icon} />
                      <ListItemText primary={name} />
                    </Grid>
                  </ListItem>
                  <Collapse in={stateDomains[name]} unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(name + '/configuration')}
                        selected={stateDomains[name] &&
                          location.pathname.startsWith('/' + name + '/configuration')}
                      >
                        <Grid container alignItems="center">
                          <Settings className={classes.nestedIcon}/>
                          <ListItemText primary={t('Configuration')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(name + '/users')}
                        selected={stateDomains[name] &&
                          location.pathname.startsWith('/' + name + '/users')}
                      >
                        <Grid container alignItems="center">
                          <People className={classes.nestedIcon}/>
                          <ListItemText primary={t('Users')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(name + '/folders')}
                        selected={stateDomains[name] &&
                          location.pathname.startsWith('/' + name + '/folders')}
                      >
                        <Grid container alignItems="center">
                          <Folder className={classes.nestedIcon}/>
                          <ListItemText primary={t('Folders')}/>
                        </Grid>
                      </ListItem>
                      <ListItem
                        className={classes.li}
                        button
                        onClick={this.handleNavigation(name + '/mailAddresses')}
                        selected={stateDomains[name] &&
                          location.pathname.startsWith('/' + name + '/mailAddresses')}
                      >
                        <Grid container alignItems="center">
                          <Mail className={classes.nestedIcon}/>
                          <ListItemText primary={t('Mail addresses')}/>
                        </Grid>
                      </ListItem>
                    </List>
                  </Collapse>
                </React.Fragment> : null;
            })}
          {this.state.tab === 0 && <React.Fragment>
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
              onClick={this.handleNavigation('dataAreaSetup')}
              className={classes.li}
              selected={location.pathname === '/dataAreaSetup'}
            >
              <Grid container alignItems="center">
                <Web className={classes.icon}/>
                <ListItemText primary={t('Data areas')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('domainList')}
              className={classes.li}
              selected={location.pathname.startsWith('/domainList')}
            >
              <Grid container alignItems="center">
                <Http className={classes.icon}/>
                <ListItemText primary={t('Domain list')} />
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
            </ListItem>
            <ListItem button onClick={this.toggleDefaults} className={classes.li}>
              <DefaultData className={classes.icon} />
              <ListItemText primary={t('Default data')} />
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
                  onClick={this.handleNavigation('orgs')}
                  selected={location.pathname.startsWith('/orgs')}
                >
                  <Grid container alignItems="center">
                    <Orgs className={classes.nestedIcon}/>
                    <ListItemText primary={t('Organizations')}/>
                  </Grid>
                </ListItem>
                <ListItem
                  className={classes.li}
                  button
                  onClick={this.handleNavigation('aliases')}
                  selected={location.pathname.startsWith('/aliases')}
                >
                  <Grid container alignItems="center">
                    <Aliases className={classes.nestedIcon}/>
                    <ListItemText primary={t('Aliases')}/>
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
                  onClick={this.handleNavigation('mailLists')}
                  selected={location.pathname.startsWith('/mailLists')}
                >
                  <Grid container alignItems="center">
                    <MLists className={classes.nestedIcon}/>
                    <ListItemText primary={t('Mail lists')}/>
                  </Grid>
                </ListItem>
                <ListItem
                  className={classes.li}
                  button
                  onClick={this.handleNavigation('classes')}
                  selected={location.pathname.startsWith('/classes')}
                >
                  <Grid container alignItems="center">
                    <Classes className={classes.nestedIcon}/>
                    <ListItemText primary={t('Classes')}/>
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
            </Collapse>
          </React.Fragment>
          }
          <div className={classes.logoutContainer}>
            <ListItem
              className={classes.li}
              button
              selected={location.pathname === '/settings'}
              onClick={this.handleNavigation('settings')}
            >
              <Grid container alignItems="center">
                <Settings className={classes.icon} />
                <ListItemText primary={t('Settings')} />
              </Grid>
            </ListItem>
            <ListItem
              button
              onClick={this.handleNavigation('changePassword')}
              className={classes.li}
            >
              <Grid container alignItems="center">
                <Lock className={classes.icon}/>
                <ListItemText primary={t('Change password')} />
              </Grid>
            </ListItem>
            <ListItem button onClick={this.handleLogout} className={classes.li}>
              <Grid container alignItems="center">
                <Run className={classes.icon} />
                <ListItemText primary={t('Logout')} />
              </Grid>
            </ListItem>
          </div>
        </List>
      </React.Fragment>
    );
  }
}

NavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  authLogout: PropTypes.func.isRequired,
  domains: PropTypes.array,
  location: PropTypes.object.isRequired,
};


const mapDispatchToProps = dispatch => {
  return {
    authLogout: async () => {
      await dispatch(authLogout());
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(NavigationLinks))));