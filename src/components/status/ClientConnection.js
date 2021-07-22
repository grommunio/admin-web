import React from 'react';
import PropTypes from 'prop-types';
import ServerZones from './ServerZones';
import { Typography } from '@material-ui/core';

function ClientConnection(props) {
  const { uri, serverZones } = props;

  const toSortedArray = obj => Object.entries(obj)
    .map(([server, values]) => ({ server, values }))
    .sort((a, b) => {
      const num1 = Number(a.server.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
      const num2 = Number(b.server.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
      return num1-num2;
    });

  return (
    <React.Fragment>
      <Typography variant="h5">
        Connections to {uri.endsWith('*') ? 'Any' : uri.endsWith('_') ? 'Other' : uri.slice(14)}
      </Typography>
      <ServerZones serverZones={toSortedArray(serverZones)} />
    </React.Fragment>
  );
}

ClientConnection.propTypes = {
  uri: PropTypes.string.isRequired,
  serverZones: PropTypes.object.isRequired,
};

export default ClientConnection;
