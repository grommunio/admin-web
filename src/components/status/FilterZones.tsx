// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import ClientConnection from './ClientConnection';
import UpstreamConnection from './UpstreamConnection';
import PathConnection from './PathConnection';
import AgentConnection from './AgentConnection';
import { FilterZones as FilterZonesType } from '@/types/status';


type FilterZonesProps = {
  filterZones: FilterZonesType;
}

function FilterZones(props: FilterZonesProps) {
  const { filterZones } = props;

  return (
    <div>
      {Object.entries(filterZones).map(([uri, values], key) =>
        uri.startsWith('client::') ? <ClientConnection key={key} uri={uri} serverZones={values || {}}/> :
          uri.startsWith('uri::') ? <PathConnection key={key} uri={uri} serverZones={values || {}}/> :
            uri.startsWith('upstream::') ? <UpstreamConnection key={key} uri={uri} serverZones={values || {}}/> : 
              <AgentConnection key={key} serverZones={values || {}}/>
      )}
    </div>
  );
}

export default FilterZones;
