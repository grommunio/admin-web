import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Http from '@material-ui/icons/Http';
import Settings from '@material-ui/icons/Settings';
import Folder from '@material-ui/icons/Folder';
import Mail from '@material-ui/icons/Mail';
import Run from '@material-ui/icons/DirectionsRun';
import People from '@material-ui/icons/People';
import grey from '../colors/grey';
import blue from '../colors/blue';
import logo from '../res/grammm_logo_only.svg';

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

class DomNavigationLinks extends PureComponent {

  constructor(props) {
    super(props);
    // Map domains array to bool obj with domains as keys
    this.state = this.props.domains.map(obj => obj.name)
      .reduce((a, b) => (a[b] = false, a), {});//eslint-disable-line
    this.listRef = React.createRef();
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleDrawer = domain => event => {
    event.preventDefault();
    let overwrite = {};
    for (const key in this.state) {
      overwrite[key] = false;
    }
    overwrite[domain] = !this.state[domain]
      || this.props.location.pathname !== '/' + domain;
    this.setState({ ...overwrite });
    this.props.history.push(`/${domain}`);
  }

  render() {
    const { classes, t, domains, location } = this.props;
    const { state } = this;

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
          {domains.map(({ domainname: name }) =>
            <React.Fragment key={name}>
              <ListItem
                onClick={this.handleDrawer(name)}
                button
                className={classes.li}
                selected={state[name] && location.pathname === '/' + name}
              >
                <Http className={classes.icon} />
                <ListItemText primary={name} />
              </ListItem>
              <Collapse in={this.state[name]} unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(name + '/configuration')}
                    selected={state[name] &&
                      location.pathname === '/' + name + '/configuration'}
                  >
                    <Settings className={classes.nestedIcon}/>
                    <ListItemText primary={t('Configuration')}/>
                  </ListItem>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(name + '/users')}
                    selected={state[name] &&
                      location.pathname === '/' + name + '/users'}
                  >
                    <People className={classes.nestedIcon}/>
                    <ListItemText primary={t('Users')}/>
                  </ListItem>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(name + '/folders')}
                    selected={state[name] &&
                      location.pathname === '/' + name + '/folders'}
                  >
                    <Folder className={classes.nestedIcon}/>
                    <ListItemText primary={t('Folders')}/>
                  </ListItem>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(name + '/mailAddresses')}
                    selected={state[name] &&
                      location.pathname === '/' + name + '/mailAddresses'}
                  >
                    <Mail className={classes.nestedIcon}/>
                    <ListItemText primary={t('Mail address list')}/>
                  </ListItem>
                </List>
              </Collapse>
            </React.Fragment>
          )}
          <div className={classes.logoutContainer}>
            <ListItem
              className={classes.li} button>
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

DomNavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  domains: PropTypes.array.isRequired,
};

export default withRouter(withTranslation()(withStyles(styles)(DomNavigationLinks)));