import React, { PureComponent } from 'react';
import { IconButton, TextField, withStyles, Tooltip } from '@material-ui/core';
import Help from '@material-ui/icons/HelpOutline';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  textfield: {
    margin: theme.spacing(2, 2),
  },
  flexTextfield: {
    flex: 1,
    margin: 10,
    minWidth: 400,
  },
  tooltip: {
    marginTop: -2,
  },
});

class LdapTextfield extends PureComponent {

  render() {
    const { classes, children, t, value, label, desc, flex, ...rest } = this.props;

    return (
      <TextField
        {...rest}
        label={t(label)}
        helperText={desc || ''}
        className={flex ? classes.flexTextfield : classes.textfield}
        color="primary"
        value={value || ''}
      >
        {children}
      </TextField>
    );
  }
}

LdapTextfield.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  desc: PropTypes.string,
  flex: PropTypes.bool,
};

export default withTranslation()(withStyles(styles)(LdapTextfield));
