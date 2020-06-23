import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import {
  AppBar,
  Toolbar,
  IconButton,
  Hidden,
  Drawer,
  Grid,
  Paper,
  MenuList,
  MenuItem,
  Popper,
  ClickAwayListener,
  Grow,
} from '@material-ui/core';
import {
  setDrawerSelected,
} from '../actions/drawer';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import PersonIcon from '@material-ui/icons/Person';
import MovementIcon from '@material-ui/icons/KeyboardTab';
import SearchIcon from '@material-ui/icons/Search';
import NavigationLinks from './NavigationLinks';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const drawerWidth = 260;

const styles = theme => ({
  /* || Top Bar */
  appBar: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  burgerButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  profileMenu: {
    marginRight: theme.spacing(2),
  },
  dropdownMenu: {
    float: 'right',
  },

  /* || Side Bar */
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: 'black',
    color: '#e6e6e6',
    boxShadow: '0 10px 30px -12px #000',
  },
});

class ResponsiveDrawer extends Component {

    state = {
      alert: false,
      path: '',
      drawerOpen: false,

      menuOpen: false,
      MenuAnchor: null,

      dropdownOpen: false,
      dropdownAnchor: null,
    };

  handleDrawerToggle = () => {
    this.setState({
      drawerOpen: !this.state.drawerOpen,
    });
  }

  handleMoveAssetClick = (event) => {
    const { history, setDrawerSelected } = this.props;
    setDrawerSelected('assets');
    this.setState({
      dropdownOpen: false,
    });

    event.preventDefault();
    history.push(`/moveAsset`);
  }

  handleAddAssetClick = event => {
    const { history, setDrawerSelected } = this.props;
    setDrawerSelected('assets');
    this.setState({
      dropdownOpen: false,
    });

    event.preventDefault();
    history.push(`/addAsset`);
  }

  handleProfileClick = (event) => {
    this.setState({
      menuOpen: !this.state.menuOpen,
      menuAnchor: event.currentTarget,
    });
  }

  handleDropdownMenu = (event) => {
    this.setState({
      dropdownOpen: !this.state.menuOpen,
      dropdownAnchor: event.currentTarget,
    });
  }

  handleCloseProfileMenu = () => {
    this.setState({
      menuOpen: false,
    });
  }

  handleCloseDropdownMenu = () => {
    this.setState({
      dropdownOpen: false,
    });
  }

  handleNavigation = path => event => {
    const { history, setDrawerSelected } = this.props;
    setDrawerSelected(path);
    event.preventDefault();
    history.push(`/${path}`);
    this.setState({
      menuOpen: false,
    });
  }

  render() {
    const { classes, t } = this.props;

    return(
      <React.Fragment>
        <AppBar position="absolute" className={classes.appBar} color="transparent">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={this.handleDrawerToggle}
              className={classes.burgerButton}
            >
              <MenuIcon />
            </IconButton>
            <Hidden xsDown implementation="js">
              <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="center">
                <Button
                  size="large"
                  startIcon={<SearchIcon/>}
                  onClick={() => this.setState({searchOpen: true})}
                >
                  {t("Search asset")}
                </Button>
                <Button
                  size="large"
                  startIcon={<MovementIcon/>}
                  onClick={this.handleMoveAssetClick}
                >
                  {t("Move asset")}
                </Button>
                <Button
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={this.handleAddAssetClick}
                  className={classes.appBarButton}
                >
                  {t("Add asset")}
                </Button>
                <IconButton onClick={this.handleProfileClick}>
                  <PersonIcon/>
                </IconButton>
                <Popper open={this.state.menuOpen} anchorEl={this.state.menuAnchor} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                      <Paper className={classes.profileMenu}>
                        <ClickAwayListener onClickAway={this.handleCloseProfileMenu}>
                          <MenuList autoFocusItem={this.state.menuOpen} id="menu-list-grow">
                            <MenuItem onClick={this.handleNavigation("profile")}>Profile</MenuItem>
                            <MenuItem onClick={this.handleNavigation("settings")}>{t("Settings")}</MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </Grid>
            </Hidden>
            <Hidden smUp>
              <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="center">
                <IconButton className={classes.dropdownMenu} onClick={this.handleDropdownMenu}>
                  <MoreVertIcon />
                </IconButton>
                <Popper open={this.state.dropdownOpen} anchorEl={this.state.dropdownAnchor} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                      <Paper className={classes.profileMenu}>
                        <ClickAwayListener onClickAway={this.handleCloseDropdownMenu}>
                          <MenuList autoFocusItem={this.state.dropdownMenu} id="menu-list-grow">
                            <MenuItem onClick={() => this.setState({searchOpen: true})}>
                              {t("Search asset")}
                            </MenuItem>
                            <MenuItem onClick={this.handleMoveAssetClick}>
                              {t("Move asset")}
                            </MenuItem>
                            <MenuItem onClick={this.handleAddAssetClick}>
                              {t("Add asset")}
                            </MenuItem>
                            <MenuItem onClick={this.handleCloseDropdownMenu}>
                              {t("Profile")}
                            </MenuItem>
                            <MenuItem onClick={this.handleNavigation("settings")}>
                              {t("Settings")}
                            </MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </Grid>
            </Hidden>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer} aria-label="navigation">
          <Hidden mdUp implementation="css">
            <Drawer
              variant="temporary"
              anchor={"left"}
              open={this.state.drawerOpen}
              onClose={this.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <NavigationLinks />
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              <NavigationLinks />
            </Drawer>
          </Hidden>
        </nav>
      </React.Fragment>
    );
  }
}

ResponsiveDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  drawer: PropTypes.object.isRequired,
  setDrawerSelected: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { drawer } = state;

  return {
    drawer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerSelected: async page => {
      await dispatch(setDrawerSelected(page));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation(withStyles(styles)(ResponsiveDrawer))));