// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, IconButton, List, ListItem,
  MenuItem,
  TextField, Tooltip, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Delete, Warning } from '@mui/icons-material';

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
    margin: theme.spacing(0, 0, 2, 0),
  },
});

class Smtp extends PureComponent {

  render() {
    const { classes, t, user, aliases, forward, forwardError, handleForwardInput, handleAliasEdit, handleRemoveAlias,
      handleAddAlias } = this.props;
    return (
      <FormControl className={classes.form}>
        <div className={classes.flexRow}>
          <Typography variant="h6">{t('E-Mail Addresses')}</Typography>
          {user?.ldapID && <Tooltip title={t("Warning") + ": " + t("Changes will be overwritten with next LDAP sync")}>
            <Warning color="warning" fontSize="inherit" style={{ fontSize: 32 }}/>  
          </Tooltip>}
        </div>
        <List className={classes.list}>
          {(aliases || []).map((alias, idx) => <ListItem key={idx} className={classes.listItem}>
            <TextField
              className={classes.listTextfield}
              value={alias}
              label={'Alias ' + (idx + 1)}
              onChange={handleAliasEdit(idx)}
            />
            <IconButton onClick={handleRemoveAlias(idx)} size="large">
              <Delete color="error" />
            </IconButton>
          </ListItem>
          )}
        </List>
        <Grid container justifyContent="center">
          <Button variant="contained" onClick={handleAddAlias}>{t('addHeadline', { item: 'E-Mail' })}</Button>
        </Grid>
        <Typography variant="h6" className={classes.headline}>{t('E-Mail forward')}</Typography>
        <Grid container className={classes.bottom} >
          <TextField
            className={classes.select}
            value={forward.forwardType === undefined ? '' : forward.forwardType}
            label={t('Forward type')}
            onChange={handleForwardInput('forwardType')}
            select
          >
            <MenuItem value={0}>{t('CC')}</MenuItem>
            <MenuItem value={1}>{t('Redirect')}</MenuItem>
          </TextField>
          <TextField
            error={forwardError}
            className={classes.listTextfield}
            value={forward.destination || ''}
            label={t('Destination')}
            onChange={handleForwardInput('destination')}
          />
        </Grid>
      </FormControl>
    );
  }
}

Smtp.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  aliases: PropTypes.array.isRequired,
  forward: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  handleAliasEdit: PropTypes.func.isRequired,
  handleAddAlias: PropTypes.func.isRequired,
  handleRemoveAlias: PropTypes.func.isRequired,
  handleForwardInput: PropTypes.func.isRequired,
  forwardError: PropTypes.bool,
};

export default withTranslation()(withStyles(styles)(Smtp));
