// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";
import AddOrg from "../components/Dialogs/AddOrg";
import GeneralDelete from "../components/Dialogs/GeneralDelete";
import { deleteOrgData, fetchOrgsData } from "../actions/orgs";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from "../proptypes/defaultTableProptypes";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";

const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
});

const Orgs = props => {
  const context = useContext(CapabilityContext);

  const columns = [
    { label: "Name", value: "name" },
    { label: "Description", value: "description" },
  ];

  const handleScroll = () => {
    const { Orgs, count } = props.orgs;
    props.handleScroll(Orgs, count);
  };

  const { classes, t, orgs, tableState, handleMatch, handleRequestSort,
    handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
    clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Organizations")}
      href="https://docs.grommunio.com/admin/administration.html#organizations"
      subtitle={t("orgs_sub")}
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search organizations")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("New organization")}
        </Button>
      </TableActionGrid>
      <Typography className={classes.count} color="textPrimary">
        {t("showingOrgs", { count: orgs.Orgs.length })}
      </Typography>
      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.value}>
                  <TableSortLabel
                    active={orderBy === column.value}
                    align="left"
                    direction={orderBy === column.value ? order : "asc"}
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
            {orgs.Orgs.map((obj, idx) => 
              <TableRow key={idx} hover onClick={handleEdit('/orgs/' + obj.ID)}>
                <TableCell>{obj.name}</TableCell>
                <TableCell>{obj.description}</TableCell>
                <TableCell align="right">
                  {writable && <IconButton onClick={handleDelete(obj)} size="small">
                    <Delete color="error" fontSize="small"/>
                  </IconButton>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {orgs.Orgs.length < orgs.count && (
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
        delete={props.delete}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting.name}
        id={deleting.ID}
      />
    </TableViewContainer>
  );
}

Orgs.propTypes = {
  orgs: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = (state) => {
  return { orgs: state.orgs };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTableData: async (params) => {
      await dispatch(fetchOrgsData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
    delete: async id => {
      await dispatch(deleteOrgData(id)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Orgs);
