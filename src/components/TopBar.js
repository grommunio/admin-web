import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, Hidden, IconButton, LinearProgress, Fade, Grid,
  Box } from '@material-ui/core';
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

  handleMenuToggle = async () => {
    const { setDrawerExpansion } = this.props;
    setDrawerExpansion();
  }

  render() {
    const { classes, t, profile, title, onAdd, fetching } = this.props;
    return (
      <AppBar position="fixed" className={classes.root}>
        <Toolbar className={classes.root}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={this.handleMenuToggle}>
              <Burger />
            </IconButton>
          </Hidden>
          <IconButton className={classes.iconButton}><MailOutlineIcon></MailOutlineIcon></IconButton>
          <IconButton className={classes.iconButton}><StarBorderIcon></StarBorderIcon></IconButton>
          <IconButton className={classes.iconButton}><SearchIcon></SearchIcon></IconButton>
          {title && <Typography className={classes.title} variant="h6">{title}</Typography>}
          <Grid container justify="flex-end">
            <Box className={classes.profileButton}>
              <Typography className={classes.username}>{profile.Profile.user.username}</Typography>
              <AccountCircleIcon className={classes.profileIcon}></AccountCircleIcon>
            </Box>
          </Grid>
          {onAdd && <div className={classes.divider}></div>}
          {onAdd && <Button onClick={onAdd} color="inherit">
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
};

const mapStateToProps = state => {
  const { domains, areas, users, folders, dashboard, services } = state;
  return {
    Domains: state.domains.Domains,
    profile: state.profile,
    fetching: domains.loading || areas.loading || users.loading || folders.loading
      || dashboard.loading || services.loading ,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerExpansion: () => {
      dispatch(setDrawerExpansion());
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(TopBar))));