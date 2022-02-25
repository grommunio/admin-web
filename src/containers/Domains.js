// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

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
  Checkbox,
  FormControlLabel,
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
import { fetchDomainData, deleteDomainData } from "../actions/domains";
import AddDomain from "../components/Dialogs/AddDomain";
import debounce from "debounce";
import DeleteDomain from "../components/Dialogs/DeleteDomain";
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

class DomainList extends Component {
  state = {
    snackbar: '',
    showDeleted: false,
    adding: false,
    deleting: false,
    orderBy: "domainname",
    order: "asc",
    match: "",
    offset: 50,
  };

  columns = [
    { label: "Domain", value: "domainname" },
    { label: "Address", value: "address" },
    { label: "Title", value: "title" },
    { label: "Active users", value: "activeUsers" },
    { label: "Maximum users", value: "maxUser" },
  ];

  handleScroll = () => {
    const { domains } = this.props;
    if (domains.Domains.length >= domains.count) return;
    if (
      Math.floor(
        document.getElementById("scrollDiv").scrollHeight -
          document.getElementById("scrollDiv").scrollTop
      ) <=
      document.getElementById("scrollDiv").offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if (!domains.loading) { 
        this.fetchDomains({
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
    this.fetchDomains({ sort: "domainname,asc" });
  }

  fetchDomains(params) {
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

  handleEdit = (domain) => (event) => {
    this.props.history.push("/domains/" + domain.ID, { ...domain });
    event.stopPropagation();
  };

  handleDelete = (domain) => (event) => {
    event.stopPropagation();
    this.setState({ deleting: domain });
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
    this.fetchDomains({
      match: value || undefined,
      sort: orderBy + "," + order,
    });
  }, 200);

  render() {
    const { classes, t, domains } = this.props;
    const {
      showDeleted,
      snackbar,
      adding,
      deleting,
      order,
      orderBy,
      match,
    } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const filteredDomains = domains.Domains.filter(d => d.domainStatus !== 3 || showDeleted);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Domains")}
        subtitle={t('domains_sub')}
        snackbar={snackbar}
        href="https://docs.grommunio.com/admin/administration.html#domains"
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAdd}
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
            <TextField
              value={match}
              onChange={this.handleMatch}
              placeholder={t("Search")}
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
                      onClick={this.handleRequestSort(column.value)}
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
                <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                  <TableCell>
                    {obj.domainname}{obj.domainname !== obj.displayname ? ` (${obj.displayname}) ` : " "}
                    {obj.domainStatus === 3 ? `[${t("Deactivated")}]` : ""}
                  </TableCell>
                  <TableCell>{obj.address}</TableCell>
                  <TableCell>{obj.title}</TableCell>
                  <TableCell>{obj.activeUsers}</TableCell>
                  <TableCell>{obj.maxUser}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(obj)} size="large">
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
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onClose={this.handleAddingClose}
        />
        <DeleteDomain
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.domainname}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

DomainList.contextType = CapabilityContext;
DomainList.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { domains: state.domains };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async (params) => {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(DomainList)));
