// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import Feedback from './Feedback';
import { withTranslation } from 'react-i18next';
import { Fade, LinearProgress } from '@mui/material';


const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 0),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
    },
    overflowY: 'scroll',
  },
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  lp: {
    position: 'absolute',
    top: 64,
    width: '100%',
  },
});

function ViewWrapper ({classes, children, snackbar, onSnackbarClose, loading}) {

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <Fade
          in={loading}
          style={{
            transitionDelay: '500ms',
          }}
        >
          <LinearProgress variant="indeterminate" color="primary" className={classes.lp}/>
        </Fade>
      </div>
      <div className={classes.base}>
        {children}
      </div>
      <Feedback
        snackbar={snackbar || ''}
        onClose={onSnackbarClose}
      />
    </div>
  );
}

ViewWrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  snackbar: PropTypes.string,
  onSnackbarClose: PropTypes.func,
  loading: PropTypes.bool,
};

export default withTranslation()(withStyles(ViewWrapper, styles));
