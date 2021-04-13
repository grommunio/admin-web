// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
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
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Delete from "@material-ui/icons/Delete";
import Search from "@material-ui/icons/Search";
import { connect } from "react-redux";
import TopBar from "../components/TopBar";
import HomeIcon from "@material-ui/icons/Home";
import blue from "../colors/blue";
import debounce from "debounce";
import Feedback from "../components/Feedback";
import AddOrg from "../components/Dialogs/AddOrg";
import GeneralDelete from "../components/Dialogs/GeneralDelete";
import { deleteOrgData, fetchOrgsData } from "../actions/orgs";

const styles = (theme) => ({
  root: {
    flex: 1,
    overflow: "auto",
  },
  base: {
    flexDirection: "column",
    padding: theme.spacing(2),
    flex: 1,
    display: "flex",
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: "flex",
    justifyContent: "flex-end",
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  pageTitleSecondary: {
    color: "#aaa",
  },
  homeIcon: {
    color: blue[500],
    position: "relative",
    top: 4,
    left: 4,
    cursor: "pointer",
  },
  circularProgress: {
    margin: theme.spacing(1, 0),
  },
  textfield: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  tools: {
    margin: theme.spacing(0, 2, 2, 2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
  deletedorg: {
    backgroundColor: "#22242f",
  },
});

class Orgs extends Component {
  state = {
    snackbar: null,
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
      if (!orgs.loading)
        this.fetchorgs({
          sort: orderBy + "," + order,
          offset,
          match: match || undefined,
        });
      this.setState({
        offset: offset + 50,
      });
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

    return (
      <div
        className={classes.root}
        onScroll={debounce(this.handleScroll, 100)}
        id="scrollDiv"
      >
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Organizations")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon
              onClick={this.handleNavigation("")}
              className={classes.homeIcon}
            ></HomeIcon>
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
            >
              {t("New organization")}
            </Button>
            <div className={classes.actions}>
              <TextField
                value={match}
                onChange={this.handleMatch}
                placeholder={t("search organizations")}
                variant={"outlined"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                color="primary"
              />
            </div>
          </Grid>
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
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {orgs.Orgs.length < orgs.count && (
              <Grid container justify="center">
                <CircularProgress
                  color="primary"
                  className={classes.circularProgress}
                />
              </Grid>
            )}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: "" })}
          />
        </div>
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
      </div>
    );
  }
}

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
