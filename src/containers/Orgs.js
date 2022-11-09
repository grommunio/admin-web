// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from "react";
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
  Grid,
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

const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  count: {
    marginLeft: 16,
  },
});

class Orgs extends Component {

  columns = [
    { label: "Name", value: "name" },
    { label: "Description", value: "description" },
  ];

  handleScroll = () => {
    const { Orgs, count, loading } = this.props.orgs;
    this.props.handleScroll(Orgs, count, loading);
  };

  render() {
    const { classes, t, orgs, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Organizations")}
        href="https://docs.grommunio.com/admin/administration.html#organizations"
        subtitle={t("orgs_sub")}
        snackbar={snackbar}
        onSnackbarClose={clearSnackbar}
        loading={loading}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!writable}
          >
            {t("New organization")}
          </Button>
          <div className={classes.actions}>
            <SearchTextfield
              value={match}
              onChange={handleMatch}
              placeholder={t("Search organizations")}
            />
          </div>
        </Grid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingOrgs", { count: orgs.Orgs.length })}
        </Typography>
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {this.columns.map((column) => (
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
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error" />
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {orgs.Orgs.length < orgs.count && (
            <Grid container justifyContent="center">
              <CircularProgress
                color="primary"
                className={classes.circularProgress}
              />
            </Grid>
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

Orgs.contextType = CapabilityContext;
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
