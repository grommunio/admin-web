// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { throttle } from 'lodash';
import { LatLngTuple } from 'leaflet';


const useStyles = makeStyles()(() => ({
  root: {
    marginTop: 8,
    marginRight: 8,
    height: 128,
  },
}));

function Map({ address="" }: { address: string }) {
  const { classes } = useStyles();
  const [coords, setCoords] = useState<LatLngTuple>([-1, -1]);

  const debounceFetch = useCallback(throttle(async (address) => {

    const osmResult = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + address).then(r => r.json());

    if(osmResult?.length) setCoords([osmResult[0].lat, osmResult[0].lon]);
  }, 500), []);

  useEffect(() => {
    debounceFetch(address);
  }, [address]);

  return (coords.length === 2 && coords[0] !== -1 && address ?
    <MapContainer
      center={coords}
      zoom={9}
      className={classes.root}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        className='map-tiles'
      />
      {coords.length === 2 && <Marker
        position={coords as LatLngTuple}
        riseOnHover
        zIndexOffset={1000}
      >
      </Marker>}
    </MapContainer> : null
  );
}

export default Map;