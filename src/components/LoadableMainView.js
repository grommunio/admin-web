// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import Drawer from './Drawer';
import AdminRoutes from '../Routes';
import DomainRoutes from '../DomainRoutes';

export default function LoadableMainView(props) {
  const { classes, authenticated, capabilities, domains, routesProps } = props;
  return (
    <div className={classes.mainView}>
      {authenticated &&
        <Drawer domains={domains}/>}
      {capabilities.includes('SystemAdmin') ?
        <AdminRoutes domains={domains} childProps={routesProps}/> :
        <DomainRoutes domains={domains} childProps={routesProps} capabilities={capabilities}/>}
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
