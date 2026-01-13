// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';

function UpstreamConnection(props) {
  const { t, uri, serverZones } = props;

  const toArray = obj => Object.entries(obj)
    .map(([server, values]) => ({ server, values }));

  return (
    <React.Fragment>
      <Typography variant="h5">{t("Upstream traffic to")  + " " + uri.slice(10)}</Typography>
      <ServerZones serverZones={toArray(serverZones)} />
    </React.Fragment>
  );
}

UpstreamConnection.propTypes = {
  uri: PropTypes.string.isRequired,
  serverZones: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(UpstreamConnection);
