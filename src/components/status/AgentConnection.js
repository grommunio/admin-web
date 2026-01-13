// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import ServerZones from './ServerZones';
import { Typography } from '@mui/material';
import windowsLogo from '../../res/windows.svg';
import macos from '../../res/macos.svg';
import thunderbird from '../../res/thunderbird.svg';
import linux from '../../res/linux.svg';
import bsd from '../../res/bsd.svg';
import android from '../../res/android.svg';
import { capitalizeFirstLetter } from '../../utils';
import { HelpOutline } from '@mui/icons-material';

function AgentConnection(props) {
  const { serverZones } = props;

  const getIcon = server => {
    switch(server) {
    case 'windows': return <img src={windowsLogo} width="16" height="16" alt=""/>;
    case 'ios': return <img src={macos} width="16" height="16" alt=""/>;
    case 'thunderbird': return <img src={thunderbird} width="16" height="16" alt=""/>;
    case 'linux': return <img src={linux} width="16" height="16" alt=""/>;
    case 'bsd': return <img src={bsd} width="16" height="16" alt=""/>;
    case 'android': return <img src={android} width="16" height="16" alt=""/>;
    case 'unknown': return <HelpOutline fontSize="small"/>;
    default: return null;
    }
  };

  const toArray = obj => Object.entries(obj)
    .map(([agent, values]) => ({
      agent,
      server: <Typography>
        {getIcon(agent)} {agent === 'ios' ? 'iOS' : capitalizeFirstLetter(agent)}
      </Typography>,
      values,
    }))
    .sort((a, b) => a.agent === 'unknown' ? 1 : a.agent.localeCompare(b.agent));

  return (
    <React.Fragment>
      <Typography variant="h5">Client details</Typography>
      <ServerZones serverZones={toArray(serverZones)} />
    </React.Fragment>
  );
}

AgentConnection.propTypes = {
  serverZones: PropTypes.object.isRequired,
};

export default AgentConnection;
