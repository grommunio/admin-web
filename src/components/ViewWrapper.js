// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Feedback from './Feedback';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setTopbarTitle } from '../actions/misc';
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

function ViewWrapper ({classes, children, topbarTitle, snackbar, onSnackbarClose, loading}) {
  const dispatch = useDispatch();

  // Set topbar title of child component
  useEffect(() => {
    dispatch(setTopbarTitle(topbarTitle));
  }, []);

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
  topbarTitle: PropTypes.string,
  snackbar: PropTypes.string,
  onSnackbarClose: PropTypes.func,
  loading: PropTypes.bool,
};

export default withTranslation()(withStyles(styles)(ViewWrapper));
