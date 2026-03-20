// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ServerZones as ServerZonesType } from '@/types/status';


type PathConnectionProps = {
  uri: string;
  serverZones: ServerZonesType;
}

function PathConnection(props: PathConnectionProps) {
  const { t } = useTranslation();
  const { uri, serverZones } = props;

  const toArray = (obj: ServerZonesType) => Object.entries(obj)
    .map(([server, values]) => ({ server, values }))
    .sort((a, b) => b.server === '*' ? -1 : a.server.localeCompare(b.server));

  return (
    <React.Fragment>
      <Typography variant="h5">{t("Path usage of") + " " + uri.slice(5)}</Typography>
      <ServerZones serverZones={toArray(serverZones)} />
    </React.Fragment>
  );
}

export default PathConnection;
