// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ServerZones as ServerZonesType } from '@/types/status';


type ClientConnectionProps = {
  uri: string;
  serverZones: ServerZonesType;
}

function ClientConnection(props: ClientConnectionProps) {
  const { t } = useTranslation();
  const { uri, serverZones } = props;

  const toSortedArray = (obj: ServerZonesType) => Object.entries(obj)
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


export default ClientConnection;
