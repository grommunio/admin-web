// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';

function PathConnection(props) {
  const { uri, t, serverZones } = props;

  const toArray = obj => Object.entries(obj)
    .map(([server, values]) => ({ server, values }))
    .sort((a, b) => b.server === '*' ? -1 : a.server.localeCompare(b.server));

  return (
    <React.Fragment>
      <Typography variant="h5">{t("Path usage of") + " " + uri.slice(5)}</Typography>
      <ServerZones serverZones={toArray(serverZones)} />
    </React.Fragment>
  );
}

PathConnection.propTypes = {
  uri: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  serverZones: PropTypes.object.isRequired,
};

export default withTranslation()(PathConnection);
