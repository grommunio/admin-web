// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';

function ClientConnection(props) {
  const { t, uri, serverZones } = props;

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
        {t("Connections to") + " " + uri.endsWith('*') ? 'Any' : uri.endsWith('_') ? 'Other' : uri.slice(14)}
      </Typography>
      <ServerZones serverZones={toSortedArray(serverZones)} />
    </React.Fragment>
  );
}

ClientConnection.propTypes = {
  uri: PropTypes.string.isRequired,
  serverZones: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ClientConnection);
