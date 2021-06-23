// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import { connect } from "react-redux";
import TopBar from "../components/TopBar";
import Feedback from "../components/Feedback";
import { fetchSyncData } from "../actions/sync";
import { CheckCircleOutlined, HighlightOffOutlined } from "@material-ui/icons";

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
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});

class Sync extends PureComponent {

  state = {
    snackbar: null,
  };

  columns = [
    { label: "PID", value: "pid", padding: "checkbox" },
    { label: "IP", value: "ip", padding: "checkbox" },
    { label: "User", value: "user" },
    { label: "Start", value: "start" },
    { label: "Dev type", value: "devtype" },
    { label: "Dev ID", value: "devid" },
    { label: "Dev agent", value: "devagent" },
    { label: "Command", value: "command" },
    { label: "Ended", value: "ended" },
    { label: "Add info", value: "addinfo" },
    { label: "Update", value: "update", padding: "checkbox" },
  ];

  fetchInterval = null;

  componentDidMount() {
    this.props.fetch({})
      .catch(snackbar => this.setState({ snackbar }));
    this.fetchInterval = setInterval(() => {
      this.handleRefresh();
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };

  handleRefresh = () => {
    this.props.fetch({})
      .catch(snackbar => this.setState({ snackbar }));
  }

  render() {
    const { classes, t, sync } = this.props;
    const { snackbar } = this.state;

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Sync")}
          </Typography>
          <Paper elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {this.columns.map((column) => (
                    <TableCell key={column.value} padding={column.padding || 'default'}>
                      {t(column.label)}
                    </TableCell>
                  ))}
                  <TableCell padding="checkbox">
                    {t('Push')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sync.map((obj, idx) =>
                  <TableRow key={idx} hover>
                    {this.columns.map((column) => (
                      <TableCell key={column.value} padding={column.padding || 'default'}>
                        {obj[column.value]}
                      </TableCell>
                    ))}
                    <TableCell padding="checkbox">
                      {obj.push ? <CheckCircleOutlined /> : <HighlightOffOutlined />}
                    </TableCell>
                  </TableRow>)
                }
              </TableBody>
            </Table>
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: "" })}
          />
        </div>
      </div>
    );
  }
}

Sync.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  sync: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { sync: state.sync.Sync };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async (params) => {
      await dispatch(fetchSyncData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Sync)));
