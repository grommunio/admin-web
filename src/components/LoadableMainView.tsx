// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import Drawer from './Drawer';
import AppRoutes from '../Routes';
import TopBar from './TopBar';
import { Domain } from '@/types/domains';


type LoadableMainViewProps = {
  classes: Record<string, string>;
  authenticated: boolean;
  capabilities: string[];
  domains: Domain[];
  routesProps: any;
}

export default function LoadableMainView(props: LoadableMainViewProps) {
  const { classes, authenticated, capabilities, domains, routesProps } = props;
  return (
    <div className={classes.mainView}>
      {authenticated &&
        <Drawer domains={domains}/>}
      {authenticated && <TopBar />}
      <AppRoutes domains={domains} childProps={routesProps} capabilities={capabilities}/>
    </div>
  );
}
