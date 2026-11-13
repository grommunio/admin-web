// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { Divider, FormControl, Grid, IconButton, MenuItem, TextField, TextFieldProps, Theme, Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import world from '../../res/world.json';
import { Call, Warning } from '@mui/icons-material';
import Map from './Map';
import { UserProperties } from '@/types/users';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));

type UserProps = {
  user: any; // TODO: Improve typing
  handlePropertyChange: (field: keyof UserProperties) => (event: any) => void
}

const User = (props: UserProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { user, handlePropertyChange } = props;
  const { properties, ldapID } = user;
  const { country, streetaddress, locality } = properties;

  const tfProps = (label: string, field: keyof UserProperties) => ({
    variant: (ldapID ? "filled" : 'outlined') as TextFieldProps["variant"],
    fullWidth: true,
    onChange: handlePropertyChange(field),
    value: properties[field] || '',
    label: t(label),
    className: classes.propertyInput,
  });

  const mapLocation = streetaddress || locality || country ? `${streetaddress || ""} ${locality || ""} ${country || ""}` : "";
    
  return (
    <FormControl className={classes.form}>
      <div className={classes.flexRow}>
        <Typography variant="h6">{t('Name')}</Typography>
        {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
          <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
        </Tooltip>}
      </div>
      <Typography variant='caption' sx={{
        alignSelf: "flex-end"
      }}>*{t("Required for grommunio-auth")}</Typography>
      <Grid container>
        <Grid className={classes.gridItem} size={12}>
          <div className={classes.grid}>
            <TextField
              {...tfProps("Titel", "displaynameprefix")}
              className={undefined}
              fullWidth={false}
              sx={{ maxWidth: 100, mr: 1 }}
            />
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
        </Grid>
        <Grid className={classes.gridItem} size={12}>
          <TextField 
            {...tfProps("Display name", "displayname")}
          />
          <TextField
            {...tfProps("Nickname", "nickname")}
          />
        </Grid>
      </Grid>
      <Divider className={classes.divider} />
      <Grid container>
        <Grid style={{ display: 'flex' }} size={mapLocation ? 3 : 6}>
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
        </Grid>
        {mapLocation && <Grid size={3}>
          <Map address={mapLocation}/>
        </Grid>}
        <Grid style={{ paddingRight: 16 }} size={6}>
          <TextField
            {...tfProps("Position", "title")}
            className={classes.input}
          />
          <TextField
            {...tfProps("Company", "companyname")}
            className={classes.input}
          />
        </Grid>
      </Grid>
      <Grid container>
        <Grid className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Locality", "locality")}
          />
          <TextField
            {...tfProps("Department", "departmentname")}
          />
        </Grid>
        <Grid className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("State", "stateorprovince")}
          />
          <TextField
            {...tfProps("Office", "officelocation")}
          />
        </Grid>
        <Grid className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Postal Code", "postalcode")}
          />
          <TextField
            {...tfProps("Assistant", "assistant")}
          />
        </Grid>
        <Grid className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Country", "country")}
            select
          >
            {world.map(country =>
              <MenuItem key={country.id} value={country.name}>
                {country.name}
              </MenuItem>  
            )}
          </TextField>
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
        </Grid>
      </Grid>
    </FormControl>
  );
}


export default User;
