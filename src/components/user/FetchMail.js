import React, { PureComponent } from 'react';
import { FormControl, Grid, IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { AddCircleOutline, Delete } from '@material-ui/icons';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
});

class FetchMail extends PureComponent {

  columns = [
    { value: 'maillist', label: "Maillist" },
    { value: 'srcUser', label: "Source user" },
  ]

  render() {
    const { classes, t, fetchmail, handleAdd, handleEdit, handleDelete } = this.props;
    return (
      <FormControl className={classes.form}>
        <Grid container alignItems="center"  className={classes.headline}>
          <Typography variant="h6">{t('Fetchmail')}</Typography>
          <IconButton onClick={handleAdd}>
            <AddCircleOutline color="primary" fontSize="small"/>
          </IconButton>
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              {this.columns.map((column) => (
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
                  {entry.mailbox}
                </TableCell>
                <TableCell>
                  {entry.srcUser}
                </TableCell>
                <TableCell align="right">
                  <IconButton>
                    <Delete color="error" onClick={handleDelete(idx)}/>
                  </IconButton>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </FormControl>
    );
  }
}

FetchMail.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetchmail: PropTypes.array.isRequired,
  handleAdd: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(FetchMail));
