// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { throttle } from 'lodash';


const styles = {
  root: {
    marginTop: 8,
    marginRight: 8,
    height: 128,
  },
};

function Map({ classes, address="" }) {
  const [coords, setCoords] = useState([]);

  const debounceFetch = useCallback(throttle(async (address) => {

    const osmResult = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + address).then(r => r.json());

    if(osmResult?.length) setCoords([osmResult[0].lat, osmResult[0].lon]);
  }, 500), []);

  useEffect(() => {
    debounceFetch(address);
  }, [address]);

  return (coords.length === 2 && address ?
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
        position={coords}
        riseOnHover
        zIndexOffset={1000}
      >
      </Marker>}
    </MapContainer> : null
  );
}

Map.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.string,
};

export default withStyles(Map, styles);