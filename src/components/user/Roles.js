import React, { PureComponent } from 'react';
import { FormControl, Select, Typography, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

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
    const { classes, t, roles, Roles, handleMultiSelect } = this.props;
    return (
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.headline}>{t('Roles')}</Typography>
        <FormControl className={classes.input}>
          <Select
            multiple
            fullWidth
            value={roles || []}
            onChange={handleMultiSelect}
            native
          >
            {(Roles || []).map((role, key) => (
              <option
                key={key}
                value={role.ID}
              >
                {role.name}
              </option>
            ))}
          </Select>
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
  handleMultiSelect: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Roles: state.roles.Roles || [],
  };
};

export default connect(mapStateToProps)(
  withTranslation()(withStyles(styles)(RolesTab)));
