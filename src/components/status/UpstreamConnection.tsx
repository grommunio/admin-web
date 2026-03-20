// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ServerZones as ServerZonesType } from '@/types/status';

type UpstreamConnectionProps = {
  uri: string;
  serverZones: ServerZonesType;
}

function UpstreamConnection(props: UpstreamConnectionProps) {
  const { t } = useTranslation();
  const { uri, serverZones } = props;

  const toArray = (obj: ServerZonesType) => Object.entries(obj)
    .map(([server, values]) => ({ server, values }));

  return (
    <React.Fragment>
      <Typography variant="h5">{t("Upstream traffic to")  + " " + uri.slice(10)}</Typography>
      <ServerZones serverZones={toArray(serverZones)} />
    </React.Fragment>
  );
}


export default UpstreamConnection;
