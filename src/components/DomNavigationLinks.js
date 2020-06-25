import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import DefaultData from '@material-ui/icons/AccountTree';
import Settings from '@material-ui/icons/Settings';
import Run from '@material-ui/icons/DirectionsRun';
import People from '@material-ui/icons/People';
import grey from '../colors/grey';
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

class DomNavigationLinks extends Component {

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

  handleDrawer = domain => () => {
    this.setState({ [domain]: !this.state[domain] });
  }

  render() {
    const { classes, t, domains } = this.props;

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
          {domains.map(domain =>
            <React.Fragment key={domain.name}>
              <ListItem
                onClick={this.handleDrawer(domain.name)}
                button
                className={classes.li}
              >
                <DefaultData className={classes.icon} />
                <ListItemText primary={domain.name} />
              </ListItem>
              <Collapse in={this.state[domain.name]} unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(domain.name + '/configuration')}
                  >
                    <People className={classes.nestedIcon}/>
                    <ListItemText primary={t('Configuration')}/>
                  </ListItem>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(domain.name + '/users')}
                  >
                    <People className={classes.nestedIcon}/>
                    <ListItemText primary={t('Users')}/>
                  </ListItem>
                  <ListItem
                    className={classes.li}
                    button
                    onClick={this.handleNavigation(domain.name + '/folders')}
                  >
                    <People className={classes.nestedIcon}/>
                    <ListItemText primary={t('Folders')}/>
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
  domains: PropTypes.array.isRequired,
};

export default withRouter(withTranslation()(withStyles(styles)(DomNavigationLinks)));