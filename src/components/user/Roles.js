// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { FormControl, TextField, Typography, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Autocomplete } from '@material-ui/lab';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
});

class RolesTab extends PureComponent {

  render() {
    const { classes, t, roles, Roles, handleAutocomplete } = this.props;
    return (
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.headline}>{t('Roles')}</Typography>
        <FormControl className={classes.input}>
          <Autocomplete
            multiple
            options={Roles || []}
            value={roles || []}
            onChange={handleAutocomplete('roles')}
            getOptionLabel={(roleID) => Roles.find(r => r.ID === roleID)?.name || ''}
            renderOption={(role) => role?.name || role || ''}
            filterOptions={(options, state) =>
              options.filter(o => o.name.toLowerCase().includes(state.inputValue.toLowerCase()))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles"
                placeholder="Search roles..."
                className={classes.input} 
              />
            )}
          />
        </FormControl>
      </FormControl>
    );
  }
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
  withTranslation()(withStyles(styles)(RolesTab)));
