import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {
  Hidden,
  Drawer,
} from '@material-ui/core';
import {
  setDrawerExpansion,
} from '../actions/drawer';
import NavigationLinks from './NavigationLinks';

const drawerWidth = 260;

const styles = theme => ({
  /* || Side Bar */
  drawer: {
    [theme.breakpoints.up('lg')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#2b3559',
    boxShadow: 'rgba(0, 0, 0, 0.06) 0px 5px 5px -3px, rgba(0, 0, 0, 0.043) 0px 8px 10px 1px, rgba(0, 0, 0, 0.035) 0px 3px 14px 2px',
    color: '#e6e6e6',
    overflowX: 'hidden',
    overflowY: 'scroll',
  },
});

class ResponsiveDomDrawer extends Component {

    state = {
      path: '',

      menuOpen: false,
      MenuAnchor: null,

      dropdownOpen: false,
      dropdownAnchor: null,
    };

    render() {
      const { classes, domains, expanded } = this.props;

      return(
        <nav className={classes.drawer} aria-label="navigation">
          <Hidden mdUp implementation="css">
            <Drawer
              variant="temporary"
              anchor={"left"}
              open={expanded}
              onClose={this.props.toggleExpansion}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <NavigationLinks domains={domains}/>
            </Drawer>
          </Hidden>
          <Hidden mdDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              <NavigationLinks domains={domains}/>
            </Drawer>
          </Hidden>
        </nav>
      );
    }
}

ResponsiveDomDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  toggleExpansion: PropTypes.func.isRequired,
  domains: PropTypes.array.isRequired,
  expanded: PropTypes.bool,
};

const mapStateToProps = state => {
  const { drawer } = state;

  return {
    ...drawer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleExpansion: async () => {
      await dispatch(setDrawerExpansion());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(ResponsiveDomDrawer))));