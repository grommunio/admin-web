// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Grid2 } from '@mui/material';
import { withStyles } from 'tss-react/mui';

const styles = theme => ({
  buttonGrid: {
    padding: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});

function TableActionGrid({ classes, tf, children }) {
  return <Grid2 container alignItems="flex-end" className={classes.buttonGrid}>
    {children || null}
    <div className={classes.actions}>
      {tf || null}
    </div>
  </Grid2>
}

TableActionGrid.propTypes = {
  classes: PropTypes.object.isRequired,
  tf: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default withStyles(TableActionGrid, styles);