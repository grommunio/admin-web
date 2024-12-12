// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { FormControl, Grid2, IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { AddCircleOutline, Delete } from '@mui/icons-material';

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
});

const FetchMail = props => {

  const columns = [
    { value: 'srcUser', label: "Source user" },
    { value: 'srcServer', label: "Source server" },
    { value: 'srcFolder', label: "Source folder" },
  ]

  const { classes, t, fetchmail, handleAdd, handleEdit, handleDelete } = props;
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

FetchMail.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetchmail: PropTypes.array.isRequired,
  handleAdd: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(FetchMail, styles));
