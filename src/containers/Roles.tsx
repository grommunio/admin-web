// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Button,
  Grid2,
  TableSortLabel,
  CircularProgress,
  Theme,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import { HelpOutline } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import { useAppDispatch, useAppSelector } from '../store';

import { fetchRolesData, deleteRolesData } from '../actions/roles';
import AddRoles from '../components/Dialogs/AddRole';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';
import { makeStyles } from 'tss-react/mui';
import { URLParams } from '@/actions/types';
import { RoleListItem, RolePermission } from '@/types/roles';


const useStyles = makeStyles()((theme: Theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
}));

const Roles = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const context = useContext(CapabilityContext);

  const { Roles: roleList, count } = useAppSelector(
    (state) => state.roles
  );

  const fetchTableData = async (params: URLParams) =>
    dispatch(fetchRolesData(params));

  const deleteItem = async (id: number) =>
    dispatch(deleteRolesData(id));

  const table = useTable<RoleListItem>({
    fetchTableData,
  });

  const {
    tableState,
    handleMatch,
    handleRequestSort,
    handleAdd,
    handleAddingSuccess,
    handleAddingClose,
    handleAddingError,
    clearSnackbar,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
    handleEdit,
    handleScroll,
  } = table;

  const { loading, order, match, adding, snackbar, deleting } =
    tableState;

  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  const onScroll = () => {
    handleScroll(roleList, count);
  };

  return (
    <TableViewContainer
      handleScroll={onScroll}
      headline={
        <span>
          {t("Roles")}
          <IconButton
            size="small"
            href="https://docs.grommunio.com/admin/administration.html#id1"
            target="_blank"
          >
            <HelpOutline fontSize="small" />
          </IconButton>
        </span>
      }
      subtitle={t('roles_sub')}
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={
          <SearchTextfield
            value={match}
            onChange={handleMatch}
            placeholder={t("Search roles")}
          />
        }
      >
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("New role")}
        </Button>
      </TableActionGrid>

      <Typography className={classes.count} color="textPrimary">
        {t("showingRoles", { count: roleList.length })}
      </Typography>

      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active
                  direction={order}
                  onClick={handleRequestSort('name')}
                >
                  {t('Name')}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t('Description')}</TableCell>
              <TableCell>{t('Permissions')}</TableCell>
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>

          <TableBody>
            {roleList.map((obj: RoleListItem) => (
              <TableRow
                key={obj.ID}
                hover
                onClick={handleEdit('/roles/' + obj.ID)}
              >
                <TableCell>{obj.name}</TableCell>
                <TableCell>{obj.description}</TableCell>
                <TableCell>
                  {obj.permissions
                    .map((perm: RolePermission) => perm.permission)
                    .toString()}
                </TableCell>
                <TableCell align="right">
                  {writable && (
                    <IconButton
                      onClick={handleDelete(obj)}
                      size="small"
                    >
                      <Delete color="error" fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {roleList.length < count && (
          <Grid2 container justifyContent="center">
            <CircularProgress
              color="primary"
              className={classes.circularProgress}
            />
          </Grid2>
        )}
      </Paper>

      <AddRoles
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onClose={handleAddingClose}
      />

      <GeneralDelete
        open={!!deleting}
        delete={deleteItem}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting?.name}
        id={deleting?.ID}
      />
    </TableViewContainer>
  );
};

export default Roles;