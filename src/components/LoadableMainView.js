// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import Drawer from './Drawer';
import AdminRoutes from '../Routes';
import TopBar from './TopBar';

export default function LoadableMainView(props) {
  const { classes, authenticated, capabilities, domains, routesProps } = props;
  return (
    <div className={classes.mainView}>
      {authenticated &&
        <Drawer domains={domains}/>}
      {authenticated && <TopBar />}
      <AdminRoutes domains={domains} childProps={routesProps} capabilities={capabilities}/>
    </div>
  );
}

LoadableMainView.propTypes = {
  classes: PropTypes.object.isRequired,
  authenticated: PropTypes.bool.isRequired,
  capabilities: PropTypes.array.isRequired,
  domains: PropTypes.array.isRequired,
  routesProps: PropTypes.object.isRequired,
};
