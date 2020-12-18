// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, Hidden, IconButton, LinearProgress, Fade,
  Box, 
  Menu,
  MenuItem} from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Burger from '@material-ui/icons/Menu';
import { setDrawerExpansion } from '../actions/drawer';
import { withTranslation } from 'react-i18next';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SearchIcon from '@material-ui/icons/Search';
import { authLogout } from '../actions/auth';
import { config } from '../config';

const mode = window.localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      marginLeft: 260,
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
    marginLeft: 4,
  },
  burger: {
    marginRight: 16,
  },
  divider: {
    height: 40,
    width: 2,
    marginLeft: 16,
    backgroundColor: '#000',
    backgroundImage: `linear-gradient(rgba(250,250,250,1) 4%, rgba(120, 120, 120, 0.7), rgba(250,250,250,1) 96%)`,
  },
  iconButton: {
    color: mode === 'light' ? '#777' : '#fff',
    cursor: 'pointer',
  },
  add: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  flexEndContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px 2px 8px',
    borderRadius: 25,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: mode === 'light' ? '#f3f3f3' : 'rgba(255, 255, 255, 0.1)',
    },
  },
  profileIcon: {
    fontSize: 40,
    color: mode === 'light' ? '#aaa' : '#444',
    marginLeft: 4,
  },
});

class TopBar extends PureComponent {

  state = {
    anchorEl: null,
  }

  handleMenuToggle = () => {
    const { setDrawerExpansion } = this.props;
    setDrawerExpansion();
  }

  handleMenuOpen = e => this.setState({
    anchorEl: e.currentTarget,
  });

  handleMenuClose = () => this.setState({
    anchorEl: null,
  });

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

  render() {
    const { classes, t, profile, title, onAdd, fetching } = this.props;
    const { anchorEl } = this.state;
    return (
      <AppBar position="fixed" className={classes.root}>
        <Toolbar className={classes.root}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={this.handleMenuToggle}>
              <Burger />
            </IconButton>
          </Hidden>
          <IconButton
            href={config.mailWebappAddress}
            disabled={!config.mailWebappAddress}
            target="_blank"
            className={classes.iconButton}
          ><MailOutlineIcon />
          </IconButton>
          <IconButton className={classes.iconButton}><StarBorderIcon></StarBorderIcon></IconButton>
          <IconButton className={classes.iconButton}><SearchIcon></SearchIcon></IconButton>
          {title && <Typography className={classes.title} variant="h6">{title}</Typography>}
          <div className={classes.flexEndContainer}>
            <Box className={classes.profileButton} onClick={this.handleMenuOpen}>
              <Typography className={classes.username}>{profile.Profile.user.username}</Typography>
              <AccountCircleIcon className={classes.profileIcon}></AccountCircleIcon>
            </Box>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={this.handleMenuClose}
            >
              <MenuItem onClick={this.handleNavigation('settings')}>
                {t('Settings')}
              </MenuItem>
              <MenuItem onClick={this.handleNavigation('changePassword')}>
                {t('Change password')}
              </MenuItem>
              <MenuItem onClick={this.handleLogout}>
                {t('Logout')}
              </MenuItem>
            </Menu>
          </div>
          {onAdd && <div className={classes.divider}></div>}
          {onAdd && <Button onClick={onAdd} color="inherit" className={classes.add}>
            <Add />{t('Add')}
          </Button>}
        </Toolbar>
        <Fade
          in={fetching}
          style={{
            transitionDelay: '500ms',
          }}
        >
          <LinearProgress variant="indeterminate" color="primary"/>
        </Fade>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  title: PropTypes.string,
  setDrawerExpansion: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  Domains: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
  fetching: PropTypes.bool,
  authLogout: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { domains, users, folders, dashboard, services } = state;
  return {
    Domains: state.domains.Domains,
    profile: state.profile,
    fetching: domains.loading || users.loading || folders.loading
      || dashboard.loading || services.loading ,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerExpansion: () => {
      dispatch(setDrawerExpansion());
    },
    authLogout: async () => {
      await dispatch(authLogout());
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(TopBar))));
