// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { Divider, FormControl, Grid, TextField, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  gridItem: {
    display: 'flex',
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
});

class Contact extends PureComponent {

  render() {
    const { classes, t, user, handlePropertyChange } = this.props;
    const { properties } = user;
    const { mobiletelephonenumber, comment, hometelephonenumber, home2telephonenumber, businesstelephonenumber,
      business2telephonenumber, pagertelephonenumber, primaryfaxnumber, assistanttelephonenumber } = properties;
    return (
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.headline}>{t('Telephone')}</Typography>
        <Grid container>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.input} 
              label={t("Business 1")} 
              fullWidth 
              value={businesstelephonenumber || ''}
              onChange={handlePropertyChange('businesstelephonenumber')}
            />
            <TextField 
              className={classes.input} 
              label={t("Privat 1")} 
              fullWidth 
              value={hometelephonenumber || ''}
              onChange={handlePropertyChange('hometelephonenumber')}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.input} 
              label={t("Business 2")} 
              fullWidth 
              value={business2telephonenumber || ''}
              onChange={handlePropertyChange('business2telephonenumber')}
            />
            <TextField 
              className={classes.input} 
              label={t("Privat 2")} 
              fullWidth 
              value={home2telephonenumber || ''}
              onChange={handlePropertyChange('home2telephonenumber')}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.input} 
              label={t("Fax")} 
              fullWidth 
              value={primaryfaxnumber || ''}
              onChange={handlePropertyChange('primaryfaxnumber')}
            />
            <TextField
              className={classes.input} 
              label={t("Mobile")} 
              fullWidth 
              value={mobiletelephonenumber || ''}
              onChange={handlePropertyChange('mobiletelephonenumber')}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.input} 
              label={t("Assistant")} 
              fullWidth 
              value={assistanttelephonenumber || ''}
              onChange={handlePropertyChange('assistanttelephonenumber')}
            />
            <TextField 
              className={classes.input} 
              label={t("Pager")} 
              fullWidth 
              value={pagertelephonenumber || ''}
              onChange={handlePropertyChange('pagertelephonenumber')}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.headline}>{t('Annotation')}</Typography>
        <TextField 
          className={classes.input}
          fullWidth
          value={comment || ''}
          onChange={handlePropertyChange('comment')}
          multiline
          variant="outlined"
          rows={4}
        />
      </FormControl>
    );
  }
}

Contact.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(Contact));