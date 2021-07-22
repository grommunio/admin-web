import React from 'react';
import PropTypes from 'prop-types';
import ServerZones from './ServerZones';
import { Typography } from '@material-ui/core';

function UpstreamConnection(props) {
  const { uri, serverZones } = props;

  const toArray = obj => Object.entries(obj)
    .map(([server, values]) => ({ server, values }));

  return (
    <React.Fragment>
      <Typography variant="h5">Upstream traffic to {uri.slice(10)}</Typography>
      <ServerZones serverZones={toArray(serverZones)} />
    </React.Fragment>
  );
}

UpstreamConnection.propTypes = {
  uri: PropTypes.string.isRequired,
  serverZones: PropTypes.object.isRequired,
};

export default UpstreamConnection;
