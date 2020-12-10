import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';
import { Paper, Typography, Grid } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { setDateString } from '../utils';

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
});

function DomainMenu(props) {
  const { classes, domain, t } = props;

  return (
    <div className={classes.root}>
      <TopBar title={domain.domainname}/>
      <div className={classes.toolbar}></div>
      <div className={classes.base}>
        <Paper className={classes.tablePaper} elevation={1}>
          <Grid container direction="column" className={classes.container}>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Domain name')}:</span>
              {domain.domainname}
            </Typography>
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
              <span className={classes.description}>{t('End day')}:</span>
              {setDateString(domain.endDay)}
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
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(DomainMenu));