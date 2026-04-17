// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Grid2,
  TableSortLabel,
  CircularProgress,
  Theme
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";

import { useTranslation } from "react-i18next";
import { useTable } from "../hooks/useTable";
import { useAppDispatch, useAppSelector } from "../store";

import AddOrg from "../components/Dialogs/AddOrg";
import GeneralDelete from "../components/Dialogs/GeneralDelete";
import { deleteOrgData, fetchOrgsData } from "../actions/orgs";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";
import { makeStyles } from "tss-react/mui";
import { URLParams } from "@/actions/types";
import { OrgListItem } from "@/types/orgs";


const useStyles = makeStyles()((theme: Theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
}));


const Orgs = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const context = useContext(CapabilityContext);

  const { Orgs: orgList, count } = useAppSelector(
    (state) => state.orgs
  );

  const fetchTableData = async (params: URLParams) =>
    dispatch(fetchOrgsData(params));

  const deleteItem = async (id: number | string) =>
    dispatch(deleteOrgData(id as number));

  const table = useTable<OrgListItem>({
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

  const { loading, order, orderBy, match, snackbar, adding, deleting } =
    tableState;

  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  const onScroll = () => {
    handleScroll(orgList, count);
  };

  const columns = [
    { label: "Name", value: "name" },
    { label: "Count", value: "domainCount" },
    { label: "Description", value: "description" },
  ];

  return (
    <TableViewContainer
      handleScroll={onScroll}
      headline={t("Organizations")}
      href="https://docs.grommunio.com/admin/administration.html#organizations"
      subtitle={t("orgs_sub")}
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={
          <SearchTextfield
            value={match}
            onChange={handleMatch}
            placeholder={t("Search organizations")}
          />
        }
      >
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("New organization")}
        </Button>
      </TableActionGrid>

      <Typography className={classes.count} color="textPrimary">
        {t("showingOrgs", { count: orgList.length })}
      </Typography>

      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.value}>
                  <TableSortLabel
                    active={orderBy === column.value}
                    direction={
                      orderBy === column.value ? order : "asc"
                    }
                    onClick={handleRequestSort(column.value)}
                  >
                    {t(column.label)}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>

          <TableBody>
            {orgList.map((obj: OrgListItem) => (
              <TableRow
                key={obj.ID}
                hover
                onClick={handleEdit("/orgs/" + obj.ID)}
              >
                <TableCell>{obj.name}</TableCell>
                <TableCell>{obj.domainCount}</TableCell>
                <TableCell>{obj.description}</TableCell>
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

        {orgList.length < count && (
          <Grid2 container justifyContent="center">
            <CircularProgress
              color="primary"
              className={classes.circularProgress}
            />
          </Grid2>
        )}
      </Paper>

      <AddOrg
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


export default Orgs;