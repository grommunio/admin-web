// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid, TableSortLabel, CircularProgress } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { fetchRolesData, deleteRolesData } from '../actions/roles';
import AddRoles from '../components/Dialogs/AddRole';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { HelpOutline } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';

const styles = theme => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
});

class Roles extends PureComponent {

  handleScroll = () => {
    const { Roles, count, loading } = this.props.roles;
    this.props.handleScroll(Roles, count, loading);
  };

  render() {
    const { classes, t, roles, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { loading, order, match, adding, snackbar, deleting } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={<span>
          {t("Roles")}
          <IconButton
            size="small"
            href="https://docs.grommunio.com/admin/administration.html#id1"
            target="_blank"
          >
            <HelpOutline fontSize="small"/>
          </IconButton>
        </span>
        }
        subtitle={t('roles_sub')}
        snackbar={snackbar}
        onSnackbarClose={clearSnackbar}
        loading={loading}
      >
        <TableActionGrid
          tf={<SearchTextfield
            value={match}
            onChange={handleMatch}
            placeholder={t("Search roles")}
          />}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!writable}
          >
            {t("New role")}
          </Button>
        </TableActionGrid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingRoles", { count: roles.Roles.length })}
        </Typography>
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active
                    align="left" 
                    direction={order}
                    onClick={handleRequestSort('name')}
                  >
                    {t('Name')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('Description')}</TableCell>
                <TableCell>{t('Permissions')}</TableCell>
                <TableCell padding="checkbox"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.Roles.map((obj, idx) =>
                <TableRow key={idx} hover onClick={handleEdit('/roles/' + obj.ID)}>
                  <TableCell>{obj.name}</TableCell>
                  <TableCell>{obj.description}</TableCell>
                  <TableCell>{obj.permissions.map(perm => perm.permission).toString()}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(roles.Roles.length < roles.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
        <AddRoles
          open={adding}
          onSuccess={handleAddingSuccess}
          onError={handleAddingError}
          onClose={handleAddingClose}
        />
        <GeneralDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
          onClose={handleDeleteClose}
          item={deleting.name}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

Roles.contextType = CapabilityContext;
Roles.propTypes = {
  roles: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return {
    roles: state.roles,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async params => {
      await dispatch(fetchRolesData(params)).catch(msg => Promise.reject(msg));
    },
    delete: async id => {
      await dispatch(deleteRolesData(id)).catch(msg => Promise.reject(msg));
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Roles);
