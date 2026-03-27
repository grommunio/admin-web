// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { FormControl, Grid2, IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { AddCircleOutline, Delete } from '@mui/icons-material';
import { FetchmailConfig } from '@/types/users';


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
}));

type FetchMailProps = {
  fetchmail: FetchmailConfig[];
  handleAdd: () => void
  handleEdit: (open: number) => () => void
  handleDelete: (idx: number) => (e: React.MouseEvent) => void
}

const FetchMail = (props: FetchMailProps) => {
  const { classes } = useStyles();
  const { fetchmail, handleAdd, handleEdit, handleDelete } = props;
  const { t } = useTranslation();
  const columns = [
    { value: 'srcUser', label: "Source user" },
    { value: 'srcServer', label: "Source server" },
    { value: 'srcFolder', label: "Source folder" },
  ]

  return (
    <FormControl className={classes.form}>
      <Grid2 container alignItems="center"  className={classes.headline}>
        <Typography variant="h6">{t('Fetchmail')}</Typography>
        <IconButton onClick={handleAdd} size="large">
          <AddCircleOutline color="primary" fontSize="small"/>
        </IconButton>
      </Grid2>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.value}>
                {t(column.label)}
              </TableCell>
            ))}
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>
          {fetchmail.map((entry, idx) => 
            <TableRow key={idx} hover onClick={handleEdit(idx)}>
              <TableCell>
                {entry.srcUser}
              </TableCell>
              <TableCell>
                {entry.srcServer}
              </TableCell>
              <TableCell>
                {entry.srcFolder}
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={handleDelete(idx)} size="large">
                  <Delete color="error"/>
                </IconButton>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </FormControl>
  );
}


export default FetchMail;
