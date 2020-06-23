import React, { Component } from 'react';
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
import Items from '@material-ui/icons/Storage';
import DefaultData from '@material-ui/icons/AccountTree';
import Settings from '@material-ui/icons/Settings';
import Dashboard from '@material-ui/icons/Dashboard';
import Run from '@material-ui/icons/DirectionsRun';
import Group from '@material-ui/icons/Category';
import Models from '@material-ui/icons/DevicesOther';
import MTypes from '@material-ui/icons/KeyboardTab';
import Location from '@material-ui/icons/LocationOn';
import Company from '@material-ui/icons/Domain';
import People from '@material-ui/icons/People';
import {
  setDrawerDefault,
  setDrawerExpansion,
  setDrawerSelected,
} from '../actions/drawer';
import { authLogout } from '../actions/auth';
import grey from '../colors/grey';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { Typography } from '@material-ui/core';

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
      background: 'linear-gradient(60deg, #66bb6a, #43a047)',
      color: 'black',
      '&:hover': {
        background: 'linear-gradient(60deg, #66bb6a, #43a047)',
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

class NavigationLinks extends Component {

  constructor(props) {
    super(props);
    const { history, setDrawerSelected, setDrawerDefault } = props;
    const location = history.location.pathname.substr(1);
    setDrawerSelected(location);
    if(location && location !== 'articles') {
      setDrawerDefault(true);
    } else {
      setDrawerDefault(false);
    }
    this.state = {
      alert: false,
      path: '',
      mobileOpen: false,
      searchDialog: false,
      profileMenu: false,
      MenuAnchor: null,
    };
    this.listRef = React.createRef();
  }

  handleNavigation = path => event => {
    const { history, setDrawerSelected } = this.props;
    if(history.location.pathname === '/addAsset') {
      this.setState({alert: true, path: path});
    } else {
      setDrawerSelected(path);
      event.preventDefault();
      history.push(`/${path}`);
    }
  }

  handleSafeNavigation = () => {
    const { history, setDrawerSelected } = this.props;

    setDrawerSelected(this.state.path);
    history.push(`/${this.state.path}`);
    this.setState({ alert: false });
  }

  toggleDefaultData = () => {
    const { setDrawerDefault, drawer } = this.props;
    
    setDrawerDefault(!drawer.defaultOpen);
  }

  handleLogout = () => {
    const { history, authLogout } = this.props;
    history.push('/');
    authLogout();
  }

  render() {
    const { classes, t, drawer } = this.props;

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
              <Typography variant="h5" color="inherit">GRAMMM</Typography>
            </Button>
          </div>
          <ListItem button onClick={this.handleNavigation('')}
            selected={drawer.selected === ''} className={classes.li}>
            <Dashboard className={classes.icon} />
            <ListItemText primary="Dashboard"/>
          </ListItem>
          <ListItem
            button
            selected={drawer.selected === ' dataAreaSetup'}
            onClick={this.handleNavigation('dataAreaSetup')}
            className={classes.li}>
            <Items className={classes.icon}/>
            <ListItemText primary={t('data area setup')} />
          </ListItem>
          <ListItem
            button
            selected={drawer.selected === 'domainList'}
            onClick={this.handleNavigation('domainList')}
            className={classes.li}>
            <Items className={classes.icon}/>
            <ListItemText primary={t('domain list')} />
          </ListItem>
          <ListItem button onClick={this.toggleDefaultData} className={classes.li}>
            <DefaultData className={classes.icon} />
            {drawer.defaultOpen ?
              <ExpandLess className={classes.expandIcon}/> 
              :
              <ExpandMore className={classes.expandIcon}/>
            }
            <ListItemText primary={t('Default data')} />
          </ListItem>
          <Collapse in={drawer.defaultOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem selected={drawer.selected === 'groups'}
                className={classes.li} button onClick={this.handleNavigation('groups')}>
                <Group className={classes.nestedIcon} />
                <ListItemText primary={t('Asset groups')} />
              </ListItem>
              <ListItem selected={drawer.selected === 'models'}
                className={classes.li} button onClick={this.handleNavigation('models')}>
                <Models className={classes.nestedIcon} />
                <ListItemText primary={t('Models')}/>
              </ListItem>
              <ListItem selected={drawer.selected === 'movementTypes'}
                className={classes.li} button onClick={this.handleNavigation('movementTypes')}>
                <MTypes className={classes.nestedIcon} />
                <ListItemText primary={t('Movement types')}/>
              </ListItem>
              <ListItem selected={drawer.selected === 'locations'}
                className={classes.li} button onClick={this.handleNavigation('locations')}>
                <Location className={classes.nestedIcon} />
                <ListItemText primary={t('Locations')}/>
              </ListItem>
              <ListItem selected={drawer.selected === 'companies'}
                className={classes.li} button onClick={this.handleNavigation('companies')}>
                <Company className={classes.nestedIcon}/>
                <ListItemText primary={t('Companies')}/>
              </ListItem>
              <ListItem selected={drawer.selected === 'people'}
                className={classes.li} button onClick={this.handleNavigation('people')}>
                <People className={classes.nestedIcon}/>
                <ListItemText primary={t('People')}/>
              </ListItem>
            </List>
          </Collapse>
          <div className={classes.logoutContainer}>
            <ListItem selected={drawer.selected === 'settings'}
              className={classes.li} button onClick={this.handleNavigation('settings')}>
              <Settings className={classes.icon} />
              <ListItemText primary={t('Settings')} />
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
  drawer: PropTypes.object.isRequired,
  setDrawerDefault: PropTypes.func.isRequired,
  setDrawerExpansion: PropTypes.func.isRequired,
  setDrawerSelected: PropTypes.func.isRequired,
  authLogout: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { drawer } = state;

  return {
    drawer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerDefault: async bool => {
      await dispatch(setDrawerDefault(bool));
    },
    setDrawerExpansion: async bool => {
      await dispatch(setDrawerExpansion(bool));
    },
    setDrawerSelected: async page => {
      await dispatch(setDrawerSelected(page));
    },
    authLogout: async () => {
      await dispatch(authLogout());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(NavigationLinks))));