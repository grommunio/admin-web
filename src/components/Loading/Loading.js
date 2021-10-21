// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Typography } from '@mui/material';

function handleRetry(event) {
  event.preventDefault();

  window.location.reload();
}

function Loading(props) {
  if (props.error) {
    console.error(props.error); // eslint-disable-line no-console
    return <div id="loader">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" style={{ marginRight: 8 }}>Error loading page</Typography>
        <Button size="small" variant="text" color="primary" onClick={ handleRetry }>Retry</Button>
      </div>
    </div>;
  } else if (props.timedOut) {
    return <div id="loader">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" style={{ marginRight: 8 }}>Taking a long time...</Typography>
        <Button size="small" variant="text" color="primary" onClick={ handleRetry }>Retry</Button>
      </div>
    </div>;
  } else if (props.pastDelay) {
    return <div id="loader">
      <CircularProgress />
    </div>;
  } else {
    return null;
  }
}

Loading.propTypes = {
  error: PropTypes.object,
  timedOut: PropTypes.bool,
  pastDelay: PropTypes.bool,
};

export default Loading;
