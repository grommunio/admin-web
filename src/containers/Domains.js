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
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Grid,
  TableSortLabel,
  CircularProgress,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";
import { fetchDomainData, deleteDomainData } from "../actions/domains";
import AddDomain from "../components/Dialogs/AddDomain";
import DeleteDomain from "../components/Dialogs/DeleteDomain";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
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

class Domains extends Component {
  state = {
    showDeleted: false,
  };

  columns = [
    { label: "Domain", value: "domainname" },
    { label: "Address", value: "address" },
    { label: "Title", value: "title" },
    { label: "Active users", value: "activeUsers" },
    { label: "Maximum users", value: "maxUser" },
  ];

  handleScroll = () => {
    const { Domains, count, loading } = this.props.domains;
    this.props.handleScroll(Domains, count, loading);
  };

  handleCheckbox = (field) => (event) =>
    this.setState({
      [field]: event.target.checked,
    });

  render() {
    const { classes, t, domains, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { showDeleted } = this.state;
    const { order, orderBy, match, snackbar, adding, deleting } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const filteredDomains = domains.Domains.filter(d => d.domainStatus !== 3 || showDeleted);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Domains")}
        subtitle={t('domains_sub')}
        snackbar={snackbar}
        href="https://docs.grommunio.com/admin/administration.html#domains"
        onSnackbarClose={clearSnackbar}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!writable}
          >
            {t("New domain")}
          </Button>
          <div className={classes.actions}>
            <FormControlLabel
              label={t("Show deactivated")}
              control={
                <Checkbox
                  checked={showDeleted || false}
                  onChange={this.handleCheckbox("showDeleted")}
                />
              }
            />
            <SearchTextfield
              value={match}
              onChange={handleMatch}
              placeholder={t("Search domains")}
            />
          </div>
        </Grid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingDomains", { count: filteredDomains.length })}
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
                      disabled={column.value === 'activeUsers'}
                    >
                      {t(column.label)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDomains.map((obj, idx) =>
                <TableRow key={idx} hover onClick={handleEdit("/domains/" + obj.ID)}>
                  <TableCell>
                    {obj.domainname}{obj.domainname !== obj.displayname ? ` (${obj.displayname}) ` : " "}
                    {obj.domainStatus === 3 ? `[${t("Deactivated")}]` : ""}
                  </TableCell>
                  <TableCell>{obj.address}</TableCell>
                  <TableCell>{obj.title}</TableCell>
                  <TableCell>{obj.activeUsers}</TableCell>
                  <TableCell>{obj.maxUser}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error" />
                    </IconButton>}
                  </TableCell>
                </TableRow>)
              }
            </TableBody>
          </Table>
          {domains.Domains.length < domains.count && (
            <Grid container justifyContent="center">
              <CircularProgress
                color="primary"
                className={classes.circularProgress}
              />
            </Grid>
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
          delete={this.props.delete}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
          onClose={handleDeleteClose}
          item={deleting.domainname}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

Domains.contextType = CapabilityContext;
Domains.propTypes = {
  domains: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = (state) => {
  return { domains: state.domains };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTableData: async (params) => {
      await dispatch(fetchDomainData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
    delete: async (id, params) => {
      await dispatch(deleteDomainData(id, params)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Domains, { orderBy: 'domainname'});
