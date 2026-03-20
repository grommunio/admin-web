// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode } from 'react';
import { TextField, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));

type LdapTextfieldProps = {
  children: ReactNode;
  value: string;
  label: string;
  desc: string;
  flex: boolean;
}

const LdapTextfield = (props: LdapTextfieldProps) => {
  const { classes } = useStyles();
  const { children, value, label, desc, flex, ...rest } = props;

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

export default LdapTextfield;
