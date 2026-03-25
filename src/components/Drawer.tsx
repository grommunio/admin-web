// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
  Drawer,
  Theme,
  useMediaQuery,
} from '@mui/material';
import {
  setDrawerOpen,
} from '../actions/drawer';
import NavigationLinks from './NavigationLinks';
import RetractedNavigationLinks from './RetractedNavigationLinks';
import { useAppDispatch, useAppSelector } from '../store';
import { Domain } from '@/types/domains';


const drawerWidth = 260;
const smallDrawerWidth = 75;

const useStyles = makeStyles()((theme: Theme) => ({
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
    border: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

type ResponsiveDrawerProps = {
  domains: Domain[];
}

function ResponsiveDrawer({ domains }: ResponsiveDrawerProps) {
  const { classes } = useStyles();
  const { open, expanded } = useAppSelector(state => state.drawer);
  const [ tab, setTab ] = useState(0);
  const dispatch = useAppDispatch();

  const lgUpHidden = useMediaQuery(theme => theme.breakpoints.up('lg'));
  const lgDownHidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  const handleToggle = () => {
    dispatch(setDrawerOpen())
  }

  return (
    <nav className={expanded ? classes.drawerExpanded : classes.drawerCollapsed} aria-label="navigation">
      {!lgUpHidden &&
      <Drawer
        variant="temporary"
        anchor={"left"}
        open={open}
        onClose={handleToggle}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <NavigationLinks domains={domains} tab={tab} setTab={setTab}/>
      </Drawer>}
      {!lgDownHidden &&
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
        </Drawer>}
    </nav>
  );
}


export default ResponsiveDrawer;
