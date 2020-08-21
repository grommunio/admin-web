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
import Dashboard from '@material-ui/icons/Dashboard';
import Run from '@material-ui/icons/DirectionsRun';
import People from '@material-ui/icons/People';
import Lock from '@material-ui/icons/Lock';
import Http from '@material-ui/icons/Http';
import Web from '@material-ui/icons/Web';
import { authLogout } from '../actions/auth';
import grey from '../colors/grey';
import logo from '../res/grammm_logo_only.svg';
import blue from '../colors/blue';

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
});

class NavigationLinks extends PureComponent {

  constructor(props) {
    super(props);
    // Map domains array to bool obj with domains as keys
    this.listRef = React.createRef();
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleDrawer = domain => event => {
    event.preventDefault();
    this.props.history.push(`/${domain}`);
  }

  handleLogout = () => {
    const { history, authLogout } = this.props;
    history.push('/');
    authLogout();
  }

  render() {
    const { classes, t, location } = this.props;

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
          <ListItem
            button
            onClick={this.handleNavigation('')}
            className={classes.li}
            selected={location.pathname === '/'}
          >
            <Dashboard className={classes.icon} />
            <ListItemText primary="Dashboard"/>
          </ListItem>
          <ListItem
            button
            onClick={this.handleNavigation('dataAreaSetup')}
            className={classes.li}
            selected={location.pathname === '/dataAreaSetup'}
          >
            <Web className={classes.icon}/>
            <ListItemText primary={t('data area setup')} />
          </ListItem>
          <ListItem
            button
            onClick={this.handleNavigation('domainList')}
            className={classes.li}
            selected={location.pathname.startsWith('/domainList')}
          >
            <Http className={classes.icon}/>
            <ListItemText primary={t('domain list')} />
          </ListItem>
          <ListItem
            button
            onClick={this.handleNavigation('baseSetup')}
            className={classes.li}
            selected={location.pathname === '/baseSetup'}
          >
            <Settings className={classes.icon}/>
            <ListItemText primary={t('base setup')} />
          </ListItem>
          <ListItem button onClick={this.toggleDefaultData} className={classes.li}>
            <DefaultData className={classes.icon} />
            <ListItemText primary={t('Default data')} />
          </ListItem>
          <Collapse in timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('groups')}
                selected={location.pathname.startsWith('/groups')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Groups')}/>
              </ListItem>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('orgs')}
                selected={location.pathname.startsWith('/orgs')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Organizations')}/>
              </ListItem>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('aliases')}
                selected={location.pathname.startsWith('/aliases')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Aliases')}/>
              </ListItem>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('forwards')}
                selected={location.pathname.startsWith('/forwards')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Forwards')}/>
              </ListItem>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('mailLists')}
                selected={location.pathname.startsWith('/mailLists')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Mail lists')}/>
              </ListItem>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('classes')}
                selected={location.pathname.startsWith('/classes')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Classes')}/>
              </ListItem>
              <ListItem
                className={classes.li}
                button
                onClick={this.handleNavigation('members')}
                selected={location.pathname.startsWith('/members')}
              >
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('Members')}/>
              </ListItem>
            </List>
          </Collapse>
          <div className={classes.logoutContainer}>
            <ListItem
              button
              onClick={this.handleNavigation('changePassword')}
              className={classes.li}>
              <Lock className={classes.icon}/>
              <ListItemText primary={t('Change password')} />
            </ListItem>
            <ListItem button onClick={this.handleLogout} className={classes.li}>
              <Run className={classes.icon} />
              <ListItemText primary={t('Logout')} />
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
  domains: PropTypes.string,
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