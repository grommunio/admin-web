// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { Divider, FormControl, Grid, InputLabel, NativeSelect, TextField, Tooltip, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import world from '../../res/world.json';
import { Warning } from '@mui/icons-material';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  address: {
    margin: theme.spacing(1),
    flex: 1,
  },
  gridItem: {
    display: 'flex',
  },
  flexTextfield: {
    flex: 1,
    marginRight: 8,
  },
  grid: {
    display: 'flex',
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  propertyInput: {
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  countrySelect: {
    margin: theme.spacing(1),
    flex: 1,
    marginLeft: 8,
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
});

class User extends PureComponent {

  render() {
    const { classes, t, user, handlePropertyChange } = this.props;
    const { properties, ldapID } = user;
    const { title, displayname, nickname, primarytelephonenumber, streetaddress,
      departmentname, companyname, officelocation, givenname, surname, initials,
      assistant, country, locality, stateorprovince, postalcode } = properties;
    return (
      <FormControl className={classes.form}>
        <div className={classes.flexRow}>
          <Typography variant="h6">{t('Name')}</Typography>
          {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
            <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
          </Tooltip>}
        </div>
        <Grid container>
          <Grid item xs={12} className={classes.gridItem}>
            <div className={classes.grid}>
              <TextField 
                className={classes.flexTextfield}
                label={t("First name")}
                value={givenname || ''}
                onChange={handlePropertyChange('givenname')}
                variant={ldapID ? "filled" : 'outlined'}
              />
              <TextField 
                //className={classes.flexTextfield}
                label={t("Initials")}
                value={initials || ''}
                onChange={handlePropertyChange('initials')}
                variant={ldapID ? "filled" : 'outlined'}
              />
            </div>
            <TextField 
              className={classes.propertyInput} 
              label={t("Surname")} 
              fullWidth 
              value={surname || ''}
              onChange={handlePropertyChange('surname')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.propertyInput}
              label={t("Display name")}
              fullWidth
              value={displayname || ''}
              onChange={handlePropertyChange('displayname')}
              variant={ldapID ? "filled" : 'outlined'}
            />
            <TextField 
              className={classes.propertyInput} 
              label={t("Nickname")} 
              fullWidth 
              value={nickname || ''}
              onChange={handlePropertyChange('nickname')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={6} style={{ display: 'flex' }}>
            <TextField 
              className={classes.address}
              label={t("Address")}
              value={streetaddress || ''}
              onChange={handlePropertyChange('streetaddress')}
              multiline
              rows={3}
              variant={ldapID ? "filled" : 'outlined'}
              inputProps={{
                style: {
                  height: 95,
                },
              }}
            />
          </Grid>
          <Grid item xs={6} style={{ paddingRight: 16 }}>
            <TextField 
              className={classes.input}
              label={t("Position")}
              fullWidth
              value={title || ''}
              onChange={handlePropertyChange('title')}
              variant={ldapID ? "filled" : 'outlined'}
            />
            <TextField 
              className={classes.input}
              label={t("Company")}
              fullWidth
              value={companyname || ''}
              onChange={handlePropertyChange('companyname')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.propertyInput}
              label={t("Locality")}
              fullWidth
              value={locality || ''}
              onChange={handlePropertyChange('locality')}
              variant={ldapID ? "filled" : 'outlined'}
            />
            <TextField 
              className={classes.propertyInput}
              label={t("Department")}
              fullWidth
              value={departmentname || ''}
              onChange={handlePropertyChange('departmentname')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.propertyInput}
              label={t("State")}
              fullWidth
              value={stateorprovince || ''}
              onChange={handlePropertyChange('stateorprovince')}
              variant={ldapID ? "filled" : 'outlined'}
            />
            <TextField 
              className={classes.propertyInput}
              label={t("Office")}
              fullWidth
              value={officelocation || ''}
              onChange={handlePropertyChange('officelocation')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <TextField 
              className={classes.propertyInput}
              label={t("Postal Code")}
              fullWidth
              value={postalcode || ''}
              onChange={handlePropertyChange('postalcode')}
              variant={ldapID ? "filled" : 'outlined'}
            />
            <TextField 
              className={classes.propertyInput}
              label={t("Assistant")}
              fullWidth
              value={assistant || ''}
              onChange={handlePropertyChange('assistant')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.countrySelect}>
              <InputLabel variant="standard">{t("Country")}</InputLabel>
              <NativeSelect
                value={country || "Germany"}
                onChange={handlePropertyChange('country')}
                fullWidth
              >
                {world.map(country =>
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>  
                )}
              </NativeSelect>
            </FormControl>
            <TextField 
              className={classes.propertyInput} 
              label={t("Telephone")} 
              fullWidth 
              value={primarytelephonenumber || ''}
              onChange={handlePropertyChange('primarytelephonenumber')}
              variant={ldapID ? "filled" : 'outlined'}
            />
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}

User.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
};


export default withTranslation()(withStyles(styles)(User));