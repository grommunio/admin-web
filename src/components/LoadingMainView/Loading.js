// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@material-ui/core';

function handleRetry(event) {
  event.preventDefault();

  window.location.reload();
}

function Loading(props) {
  if (props.error) {
    console.error(props.error); // eslint-disable-line no-console
    return <div id="loader">Error &mdash; <button onClick={ handleRetry }>Retry</button></div>;
  } else if (props.timedOut) {
    return <div id="loader">Taking a long time... &mdash; <button onClick={ handleRetry }>Retry</button></div>;
  } else if (props.pastDelay) {
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      zIndex: 10000,
    }}
    id="loader"
    >
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
