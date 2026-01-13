// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { TextField } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';

const styles = theme => ({
  textfield: {
    margin: theme.spacing(2, 2, 1, 2),
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

const LdapTextfield = props => {
  const { classes, children, value, label, desc, flex, ...rest } = props;

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

LdapTextfield.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  desc: PropTypes.string,
  flex: PropTypes.bool,
};

export default withStyles(LdapTextfield, styles);
