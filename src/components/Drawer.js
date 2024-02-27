// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {
  Hidden,
  Drawer,
} from '@mui/material';
import {
  setDrawerOpen,
} from '../actions/drawer';
import NavigationLinks from './NavigationLinks';
import RetractedNavigationLinks from './RetractedNavigationLinks';
import { withRouter } from '../hocs/withRouter';

const drawerWidth = 260;
const smallDrawerWidth = 75;

const styles = theme => ({
  /* || Side Bar */
  drawerExpanded: {
    [theme.breakpoints.up('lg')]: {
      width: drawerWidth,
    },
  },
  drawerCollapsed: {
    [theme.breakpoints.up('lg')]: {
      width: smallDrawerWidth,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#121315',
    // eslint-disable-next-line max-len
    boxShadow: 'rgba(0, 0, 0, 0.06) 0px 5px 5px -3px, rgba(0, 0, 0, 0.043) 0px 8px 10px 1px, rgba(0, 0, 0, 0.035) 0px 3px 14px 2px',
    color: '#e6e6e6',
    overflowX: 'hidden',
    overflowY: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    border: "none",
    borderRadius: 0,
  },
  smallDrawerPaper: {
    width: smallDrawerWidth,
    backgroundColor: '#121315',
    // eslint-disable-next-line max-len
    boxShadow: 'rgba(0, 0, 0, 0.06) 0px 5px 5px -3px, rgba(0, 0, 0, 0.043) 0px 8px 10px 1px, rgba(0, 0, 0, 0.035) 0px 3px 14px 2px',
    color: '#e6e6e6',
    overflowX: 'hidden',
    overflowY: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
});

function ResponsiveDrawer(props) {
  const { classes, domains, open, expanded } = props;
  const [ tab, setTab ] = useState(0);

  return (
    <nav className={expanded ? classes.drawerExpanded : classes.drawerCollapsed} aria-label="navigation">
      <Hidden>
        <Drawer
          variant="temporary"
          anchor={"left"}
          open={open}
          onClose={props.toggleOpen}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <NavigationLinks domains={domains} tab={tab} setTab={setTab}/>
        </Drawer>
      </Hidden>
      <Hidden lgDown>
        <Drawer
          classes={{
            paper: expanded ? classes.drawerPaper : classes.smallDrawerPaper,
          }}
          variant="permanent"
          open
        >
          {expanded ?
            <NavigationLinks domains={domains} tab={tab} setTab={setTab}/> :
            <RetractedNavigationLinks domains={domains} tab={tab} setTab={setTab}/>}
        </Drawer>
      </Hidden>
    </nav>
  );
}

ResponsiveDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  domains: PropTypes.array.isRequired,
  expanded: PropTypes.bool,
  open: PropTypes.bool,
};

const mapStateToProps = state => {
  const { drawer } = state;

  return {
    ...drawer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleOpen: async () => {
      await dispatch(setDrawerOpen());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(withStyles(styles)(ResponsiveDrawer))));
