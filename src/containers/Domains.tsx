// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Grid2,
  TableSortLabel,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  Theme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";

import { useTranslation } from "react-i18next";
import { useTable } from "../hooks/useTable";
import { useAppDispatch, useAppSelector } from "../store";

import { fetchDomainData } from "../actions/domains";
import AddDomain from "../components/Dialogs/AddDomain";
import DeleteDomain from "../components/Dialogs/DeleteDomain";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";
import { makeStyles } from "tss-react/mui";
import { URLParams } from "@/actions/types";
import { ChangeEvent } from "@/types/common";
import { DomainListItem } from "@/types/domains";


const useStyles = makeStyles()((theme: Theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
}));

const Domains = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const context = useContext(CapabilityContext);

  const { Domains: domainList, count } = useAppSelector(
    (state) => state.domains
  );

  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const fetchTableData = async (params: URLParams) =>
    dispatch(fetchDomainData(params));

  const table = useTable<DomainListItem>({
    fetchTableData,
    defaultState: { orderBy: "domainname" },
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

  const filteredDomains = domainList.filter(
    (d: DomainListItem) => d.domainStatus !== 3 || showDeleted
  );

  const handleCheckbox = (event: ChangeEvent) =>
    setShowDeleted(event.target.checked);

  const onScroll = () => {
    handleScroll(domainList, count);
  };

  const columns = [
    { label: "Domain", value: "domainname" },
    { label: "Address", value: "address" },
    { label: "Title", value: "title" },
    { label: "Active users", value: "activeUsers" },
    { label: "Inactive users", value: "inactiveUsers" },
    { label: "Virtual users", value: "virtualUsers" },
    { label: "Maximum users", value: "maxUser" },
  ];

  const lgUpHidden = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("lg")
  );
  const lgDownHidden = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg")
  );

  return (
    <TableViewContainer
      handleScroll={onScroll}
      headline={t("Domains")}
      subtitle={t("domains_sub")}
      snackbar={snackbar}
      href="https://docs.grommunio.com/admin/administration.html#domains"
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={
          <>
            <FormControlLabel
              label={t("Show deactivated")}
              control={
                <Checkbox
                  checked={showDeleted}
                  onChange={handleCheckbox}
                />
              }
            />
            <SearchTextfield
              value={match}
              onChange={handleMatch}
              placeholder={t("Search domains")}
            />
          </>
        }
      >
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("New domain")}
        </Button>
      </TableActionGrid>

      <Typography className={classes.count} color="textPrimary">
        {t("showingDomains", { count: filteredDomains.length })}
      </Typography>

      <Paper elevation={1}>
        {!lgDownHidden && (
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
                      disabled={column.value === "activeUsers"}
                    >
                      {t(column.label)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredDomains.map((obj: DomainListItem) => (
                <TableRow
                  key={obj.ID}
                  hover
                  onClick={handleEdit("/domains/" + obj.ID)}
                >
                  <TableCell>
                    {obj.domainname}
                    {obj.domainname !== obj.displayname &&
                      ` (${obj.displayname}) `}
                    {obj.domainStatus === 3 &&
                      `[${t("Deactivated")}]`}
                  </TableCell>
                  <TableCell>{obj.address || ""}</TableCell>
                  <TableCell>{obj.title || ""}</TableCell>
                  <TableCell>{obj.activeUsers}</TableCell>
                  <TableCell>{obj.inactiveUsers}</TableCell>
                  <TableCell>{obj.virtualUsers}</TableCell>
                  <TableCell>{obj.maxUser}</TableCell>
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
        )}

        {!lgUpHidden && (
          <List>
            {filteredDomains.map((obj) => (
              <ListItemButton
                key={obj.ID}
                onClick={handleEdit("/domains/" + obj.ID)}
                divider
              >
                <ListItemText
                  primary={`${obj.domainname}${
                    obj.domainname !== obj.displayname
                      ? ` (${obj.displayname})`
                      : ""
                  } ${
                    obj.domainStatus === 3
                      ? `[${t("Deactivated")}]`
                      : ""
                  }`}
                  secondary={`${obj.activeUsers} / ${obj.maxUser} ${t(
                    "Maximum users"
                  )}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {domainList.length < count && (
          <Grid2 container justifyContent="center">
            <CircularProgress
              color="primary"
              className={classes.circularProgress}
            />
          </Grid2>
        )}
      </Paper>

      <AddDomain
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onClose={handleAddingClose}
      />

      <DeleteDomain
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting?.domainname}
        id={deleting?.ID}
      />
    </TableViewContainer>
  );
};


export default Domains;
