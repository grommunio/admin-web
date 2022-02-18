// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import { withTranslation } from "react-i18next";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";
import Search from "@mui/icons-material/Search";
import { connect } from "react-redux";
import debounce from "debounce";
import AddOrg from "../components/Dialogs/AddOrg";
import GeneralDelete from "../components/Dialogs/GeneralDelete";
import { deleteOrgData, fetchOrgsData } from "../actions/orgs";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";

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
  state = {
    snackbar: '',
    adding: false,
    deleting: false,
    orderBy: "name",
    order: "asc",
    match: "",
    offset: 50,
  };

  columns = [
    { label: "Name", value: "name" },
    { label: "Description", value: "description" },
  ];

  handleScroll = () => {
    const { orgs } = this.props;
    if (orgs.Orgs.length >= orgs.count) return;
    if (
      Math.floor(
        document.getElementById("scrollDiv").scrollHeight -
          document.getElementById("scrollDiv").scrollTop
      ) <=
      document.getElementById("scrollDiv").offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if (!orgs.loading) {
        this.fetchorgs({
          sort: orderBy + "," + order,
          offset,
          match: match || undefined,
        });
        this.setState({
          offset: offset + 50,
        });
      }
    }
  };

  componentDidMount() {
    this.fetchorgs({ sort: "name,asc" });
  }

  fetchorgs(params) {
    this.props.fetch(params).catch((msg) => this.setState({ snackbar: msg }));
  }

  handleRequestSort = (orderBy) => () => {
    const { fetch } = this.props;
    const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
    const order =
      stateOrderBy === orderBy && stateOrder === "asc" ? "desc" : "asc";

    fetch({
      sort: orderBy + "," + order,
      match: match || undefined,
    }).catch((msg) => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      orderBy: orderBy,
      offset: 0,
    });
  };

  handleAdd = () => this.setState({ adding: true });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

  handleAddingError = (error) => this.setState({ snackbar: error });

  handleEdit = (org) => (event) => {
    this.props.history.push("/orgs/" + org.ID, { ...org });
    event.stopPropagation();
  };

  handleDelete = (org) => (event) => {
    event.stopPropagation();
    this.setState({ deleting: org });
  };

  handleDeleteSuccess = () =>
    this.setState({ deleting: false, snackbar: "Success!" });

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = (error) => this.setState({ snackbar: error });

  handleCheckbox = (field) => (event) =>
    this.setState({
      [field]: event.target.checked,
    });

  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };

  handleMatch = (e) => {
    const { value } = e.target;
    this.debouceFetch(value);
    this.setState({ match: value });
  };

  debouceFetch = debounce((value) => {
    const { order, orderBy } = this.state;
    this.fetchorgs({
      match: value || undefined,
      sort: orderBy + "," + order,
    });
  }, 200);

  render() {
    const { classes, t, orgs } = this.props;
    const {
      snackbar,
      adding,
      deleting,
      order,
      orderBy,
      match,
    } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Organizations")}
        href="https://docs.grommunio.com/admin/administration.html#organizations"
        subtitle={t("orgs_sub")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAdd}
            disabled={!writable}
          >
            {t("New organization")}
          </Button>
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={this.handleMatch}
              placeholder={t("Search organizations")}
              variant={"outlined"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              }}
              color="primary"
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
                      onClick={this.handleRequestSort(column.value)}
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
                <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                  <TableCell>{obj.name}</TableCell>
                  <TableCell>{obj.description}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(obj)} size="large">
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
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onClose={this.handleAddingClose}
        />
        <GeneralDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.name}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

Orgs.contextType = CapabilityContext;
Orgs.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  orgs: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { orgs: state.orgs };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async (params) => {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Orgs)));
