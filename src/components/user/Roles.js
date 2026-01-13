// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext } from 'react';
import { FormControl, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { CapabilityContext } from '../../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../../constants';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

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
});

const RolesTab = props => {
  const { classes, t, roles, Roles, handleAutocomplete } = props;
  const context = useContext(CapabilityContext);    

  return (
    <FormControl className={classes.form}>
      <Typography variant="h6" className={classes.headline}>{t('Roles')}</Typography>
      <FormControl className={classes.input}>
        <MagnitudeAutocomplete
          multiple
          disabled={!context.includes(SYSTEM_ADMIN_WRITE)}
          value={roles || []}
          filterAttribute={'name'}
          getOptionLabel={(roleID) => Roles.find(r => r.ID === roleID)?.name || ''}
          onChange={handleAutocomplete('roles')}
          className={classes.input} 
          options={Roles || []}
          label={t('Roles')}
          isOptionEqualToValue={(option, value) => option.ID === value}
          placeholder={t("Search roles") + "..."}
          renderOption={(props, option) => (
            <li {...props} key={option.ID}>
              {option.name || option || ''}
            </li>
          )}
        />
      </FormControl>
    </FormControl>
  );
}

RolesTab.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
  Roles: PropTypes.array.isRequired,
  handleAutocomplete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Roles: state.roles.Roles || [],
  };
};

export default connect(mapStateToProps)(
  withTranslation()(withStyles(RolesTab, styles)));
