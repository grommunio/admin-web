// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';
import { Paper, Typography, Grid, Button } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { SYS_ADMIN } from '../constants';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  }, 
  toolbar: theme.mixins.toolbar,
  tablePaper: {
    margin: theme.spacing(3, 2),
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    width: 240,
  },
  data: {
    padding: '8px 0',
  },
  container: {
    margin: theme.spacing(2),
  },
  firstRow: {
    display: 'flex',
    flex: 1,
    paddingBottom: 8,
  },
  editButtonContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 28,
  },
});

function DomainMenu(props) {
  const { classes, domain, t, role } = props;

  const handleNav = () => {
    const { domain, history } = props;
    history.push('/domainList/' + domain.ID);
  };

  return (
    <div className={classes.root}>
      <TopBar title={domain.domainname}/>
      <div className={classes.toolbar}></div>
      <div className={classes.base}>
        <Paper className={classes.tablePaper} elevation={1}>
          <Grid container direction="column" className={classes.container}>
            <Grid item className={classes.firstRow}>
              <Typography variant="h6">
                <span className={classes.description}>{t('Domain name')}:</span>
                {domain.domainname}
              </Typography>
              {role === SYS_ADMIN && <div className={classes.editButtonContainer}>
                <Button
                  onClick={handleNav}
                  variant="contained"
                  color="primary"
                >
                  {t('editHeadline', { item: 'domain' })}
                </Button>
              </div>}
            </Grid>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Title')}:</span>
              {domain.title}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Address')}:</span>
              {domain.address}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Admin')}:</span>
              {domain.adminName}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Max users')}:</span>
              {domain.maxUser}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Telephone')}:</span>
              {domain.tel}
            </Typography>
          </Grid>
        </Paper>
      </div>
    </div>
  );
}

DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
  role: PropTypes.number,
};

const mapStateToProps = state => {
  return {
    role: state.auth.role,
  };
};

export default withRouter(connect(mapStateToProps)(
  withTranslation()(withStyles(styles)(DomainMenu))));
