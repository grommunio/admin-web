// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Divider, FormControl, Grid2, TextField, TextFieldProps, Theme, Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { Warning } from '@mui/icons-material';
import { UserProperties } from '@/types/users';


const useStyles = makeStyles()((theme: Theme) => ({
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
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
}));

type ContactProps = {
  user: any; // TODO: Improve typing
  handlePropertyChange: (field: keyof UserProperties) => (event: any) => void
} 

const Contact = (props: ContactProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { user, handlePropertyChange } = props;
  const { properties, ldapID } = user;

  const tfProps = (label: string, field: keyof UserProperties) => ({
    variant: (ldapID ? "filled" : 'outlined') as TextFieldProps["variant"],
    fullWidth: true,
    onChange: handlePropertyChange(field),
    value: properties[field] || '',
    label: t(label),
    className: classes.input,
  });

  return (
    (<FormControl className={classes.form}>
      <div className={classes.flexRow}>
        <Typography variant="h6">{t('Telephone')}</Typography>
        {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
          <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
        </Tooltip>}
      </div>
      <Grid2 container>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField 
            {...tfProps("Business 1", 'businesstelephonenumber')}
          />
          <TextField
            {...tfProps("Privat 1", 'hometelephonenumber')}
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Business 2", 'business2telephonenumber')}
          />
          <TextField
            {...tfProps("Privat 2", 'home2telephonenumber')}
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Fax", 'primaryfaxnumber')}
          />
          <TextField
            {...tfProps("Mobile", 'mobiletelephonenumber')}
          />
        </Grid2>
        <Grid2 className={classes.gridItem} size={12}>
          <TextField
            {...tfProps("Assistant", 'assistanttelephonenumber')}
          />
          <TextField
            {...tfProps("Pager", 'pagertelephonenumber')}
          />
        </Grid2>
      </Grid2>
      <Divider className={classes.divider}/>
      <div className={classes.flexRow}>
        <Typography variant="h6">{t('Annotation')}</Typography>
        {ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
          <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
        </Tooltip>}
      </div>
      <TextField
        {...tfProps("", 'comment')}
        multiline
        rows={4}
      />
    </FormControl>)
  );
}


export default Contact;
