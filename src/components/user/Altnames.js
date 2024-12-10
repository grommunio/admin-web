// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { Button, FormControl, Grid, IconButton, List, ListItem,
  TextField, Tooltip, Typography } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Delete, Warning } from '@mui/icons-material';
import { validateAltname } from '../../utils';

const styles = theme => ({
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
  },
});

const Altnames = props => {
  const { classes, t, user, handleAltnameEdit } = props;
  const { altnames } = user;

  return (
    <FormControl className={classes.form}>
      <div className={classes.flexRow}>
        <Typography variant="h6">{t('Alternative names')}</Typography>
        {user?.ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
          <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
        </Tooltip>}
      </div>
      <Typography variant='caption' sx={{ mb: 2 }}>
        {`${t("Alternative usernames to log into the mail-client with")} (${t("Does not have to include the domainname")})`}
      </Typography>
      <List className={classes.list}>
        {(altnames || []).map((alt, idx) => <ListItem key={idx} className={classes.listItem}>
          <TextField
            className={classes.listTextfield}
            value={alt.altname || ""}
            label={t("Alt name") + ' ' + (idx + 1)}
            onChange={handleAltnameEdit("edit", idx)}
            error={!validateAltname(alt.altname)}
          />
          <IconButton onClick={handleAltnameEdit("delete", idx)} size="large">
            <Delete color="error" />
          </IconButton>
        </ListItem>
        )}
      </List>
      <Grid container justifyContent="center">
        <Button variant="contained" onClick={handleAltnameEdit("add")}>{t('addHeadline', { item: 'Alternative name' })}</Button>
      </Grid>
    </FormControl>
  );
}

Altnames.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  handleAltnameEdit: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(Altnames, styles));
