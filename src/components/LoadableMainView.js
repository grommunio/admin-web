import React from 'react';
import PropTypes from 'prop-types';
import ResponsiveDomDrawer from './ResponsiveDomDrawer';
import AdminRoutes from '../Routes';
import DomainRoutes from '../DomainRoutes';
import { SYS_ADMIN } from '../constants';

export default function LoadableMainView(props) {
  const { classes, authenticated, role, domains, routesProps } = props;
  return (
    <div className={classes.mainView}>
      {authenticated &&
        <ResponsiveDomDrawer domains={domains}/>}
      {role === SYS_ADMIN ?
        <AdminRoutes domains={domains} childProps={routesProps}/> :
        <DomainRoutes domains={domains} childProps={routesProps}/>}
    </div>
  );
}

LoadableMainView.propTypes = {
  classes: PropTypes.object.isRequired,
  authenticated: PropTypes.bool.isRequired,
  role: PropTypes.number.isRequired,
  domains: PropTypes.array.isRequired,
  routesProps: PropTypes.object.isRequired,
};