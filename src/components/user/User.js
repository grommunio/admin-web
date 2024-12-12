// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { Divider, FormControl, Grid2, IconButton, InputLabel, NativeSelect, TextField, Tooltip, Typography } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import world from '../../res/world.json';
import { Call, Warning } from '@mui/icons-material';
import Map from './Map';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
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
    margin: theme.spacing(1),
    flex: 1,
  },
  propertyInput: {
    margin: theme.spacing(1),
    flex: 1,
  },
  countrySelect: {
    margin: theme.spacing(1),
    flex: 1,
    marginLeft: 8,
  },
  flexRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const User = props => {
  const { classes, t, user, handlePropertyChange } = props;
  const { properties, ldapID } = user;
  const { country, streetaddress, locality } = properties;

  const tfProps = (label, field) => ({
    variant: ldapID ? "filled" : 'outlined',
    fullWidth: true,
    onChange: handlePropertyChange(field),
    value: properties[field] || '',
    label: t(label),
    className: classes.propertyInput,
  });

  const mapLocation = streetaddress || locality || country ? `${streetaddress || ""} ${locality || ""} ${country || ""}` : "";
    
  return (
    (<FormControl className={classes.form}>
      <div className={classes.flexRow}>
        <Typography variant="h6">{t('Name')}</Typography>
        {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
          <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
        </Tooltip>}
      </div>
      <Typography alignSelf="flex-end" variant='caption'>*{t("Required for grommunio-auth")}</Typography>
      <Grid2 container>
        <Grid2 className={classes.gridItem} size={12}>
          <div className={classes.grid}>
            <TextField 
              {...tfProps("First name", "givenname")}
              className={classes.flexTextfield}
              fullWidth={false}
              required
            />
            <TextField 
              {...tfProps("Initials", "initials")}
              className={undefined}
              fullWidth={false}
            />
          </div>
          <TextField
            {...tfProps("Surname", "surname")}
            required
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField 
            {...tfProps("Display name", "displayname")}
          />
          <TextField
            {...tfProps("Nickname", "nickname")}
          />
        </Grid2>
      </Grid2>
      <Divider className={classes.divider} />
      <Grid2 container>
        <Grid2 style={{ display: 'flex' }} size={mapLocation ? 3 : 6}>
          <TextField 
            {...tfProps("Address", "streetaddress")}
            fullWidth={false}
            multiline
            rows={4}
            slotProps={{
              input: {
                style: {
                  minHeight: 128,
                }
              }
            }}
          />
        </Grid2>
        {mapLocation && <Grid2 size={3}>
          <Map address={mapLocation}/>
        </Grid2>}
        <Grid2 style={{ paddingRight: 16 }} size={6}>
          <TextField
            {...tfProps("Position", "title")}
            className={classes.input}
          />
          <TextField
            {...tfProps("Company", "companyname")}
            className={classes.input}
          />
        </Grid2>
      </Grid2>
      <Grid2 container>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Locality", "locality")}
          />
          <TextField
            {...tfProps("Department", "departmentname")}
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("State", "stateorprovince")}
          />
          <TextField
            {...tfProps("Office", "officelocation")}
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Postal Code", "postalcode")}
          />
          <TextField
            {...tfProps("Assistant", "assistant")}
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
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
            {...tfProps("Telephone", "primarytelephonenumber")}
            slotProps={{
              input: {
                endAdornment: properties.primarytelephonenumber ? <Tooltip title={"Call " + properties.primarytelephonenumber}>
                  <IconButton href={properties.primarytelephonenumber ? "tel:" + properties.primarytelephonenumber : ""}>
                    <Call />
                  </IconButton>
                </Tooltip> : null,
              }
            }}
          />
        </Grid2>
      </Grid2>
    </FormControl>)
  );
}

User.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
};


export default withTranslation()(withStyles(User, styles));