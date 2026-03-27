// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Button, FormControl, Grid2, IconButton, List, ListItem,
  MenuItem,
  TextField, Theme, Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { Delete, Warning } from '@mui/icons-material';
import { Forward } from '@/types/users';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  listItem: {
    padding: theme.spacing(1, 0, 1, 0),
  },
  listTextfield: {
    flex: 1,
  },
  select: {
    width: 180,
    marginRight: 8,
  },
  bottom: {
    margin: theme.spacing(2, 0, 4, 0),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
}));


type SmtpProps = {
  user: any; // TODO: Improve
  aliases: string[];
  forward: Forward;
  forwardError: boolean;
  handleForwardInput: (field: string) => (e: ChangeEvent) => void
  handleAliasEdit: (idx: number) => (event: ChangeEvent) => void
  handleAddAlias: () => void
  handleRemoveAlias: (idx: number) => () => void
}

const Smtp = ({ user, aliases, forward, forwardError, handleForwardInput, handleAliasEdit,
  handleRemoveAlias, handleAddAlias }: SmtpProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();

  return (
    <FormControl className={classes.form}>
      <div className={classes.flexRow}>
        <Typography variant="h6">{t('E-Mail Addresses')}</Typography>
        {user?.ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
          <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
        </Tooltip>}
      </div>
      <List>
        {(aliases || []).map((alias, idx) => <ListItem key={idx} className={classes.listItem}>
          <TextField
            className={classes.listTextfield}
            value={alias}
            label={t("Alias") + ' ' + (idx + 1)}
            onChange={handleAliasEdit(idx)}
          />
          <IconButton onClick={handleRemoveAlias(idx)} size="large">
            <Delete color="error" />
          </IconButton>
        </ListItem>
        )}
      </List>
      <Grid2 container justifyContent="center">
        <Button variant="contained" onClick={handleAddAlias}>{t('addHeadline', { item: 'E-Mail' })}</Button>
      </Grid2>
      <Typography variant="h6" className={classes.headline}>{t('E-Mail forward')}</Typography>
      <Grid2 container className={classes.bottom} >
        <TextField
          className={classes.select}
          value={forward?.forwardType === undefined ? '' : forward.forwardType}
          label={t('Forward type')}
          onChange={handleForwardInput('forwardType')}
          select
        >
          <MenuItem value={""}></MenuItem>
          <MenuItem value={0}>{t('CC')}</MenuItem>
          <MenuItem value={1}>{t('Redirect')}</MenuItem>
        </TextField>
        <TextField
          error={forwardError}
          className={classes.listTextfield}
          value={forward?.destination || ''}
          label={t('Destination')}
          onChange={handleForwardInput('destination')}
        />
      </Grid2>
    </FormControl>
  );
}


export default Smtp;
