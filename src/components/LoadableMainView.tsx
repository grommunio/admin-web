// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import Drawer from './Drawer';
import AppRoutes from '../Routes';
import TopBar from './TopBar';
import { Domain } from '@/types/domains';
import { makeStyles } from 'tss-react/mui';


const useStyles = makeStyles()(() => ({
  mainView: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    zIndex: 100,
  },
}));


type LoadableMainViewProps = {
  authenticated: boolean;
  capabilities: string[];
  domains: Domain[];
  routesProps: any;
}

export default function LoadableMainView(props: LoadableMainViewProps) {
  const { classes } = useStyles();
  const { authenticated, capabilities, domains, routesProps } = props;
  return (
    <div className={classes.mainView}>
      {authenticated &&
        <Drawer domains={domains}/>}
      {authenticated && <TopBar />}
      <AppRoutes domains={domains} routesProps={routesProps} capabilities={capabilities}/>
    </div>
  );
}
