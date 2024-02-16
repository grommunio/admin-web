// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
  textfield: {
    margin: theme.spacing(2),
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
    const { classes, children, value, label, desc, flex, ...rest } = this.props;

    return (
      <TextField
        {...rest}
        label={label}
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
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  desc: PropTypes.string,
  flex: PropTypes.bool,
};

export default withStyles(styles)(LdapTextfield);
