// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import {
  Divider,
  Paper,
  Typography,
} from "@material-ui/core";
import { connect } from "react-redux";
import TopBar from "../components/TopBar";
import blue from "../colors/blue";
import Feedback from "../components/Feedback";
import { fetchMailQData } from "../actions/mailq";

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
  logViewer: {
    display: 'flex',
    flex: 1,
  },
  log: {
    fontSize: 16,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  noticeLog: {
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  errorLog: {
    fontSize: 16,
    cursor: 'pointer',
    color: 'red',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  paper: {
    flex: 1,
    padding: theme.spacing(2),
  },
  table: {
    margin: theme.spacing(0, 0, 4, 0),
  },
  li: {
    cursor: 'pointer',
  },
  tf: {
    margin: theme.spacing(2),
    maxWidth: 200,
  },
});

class Status extends PureComponent {

  state = {
    q: [],
    snackbar: null,
  };

  fetchInterval = null;

  async componentDidMount() {
    this.fetchData();
    this.fetchInterval = setInterval(() => {
      this.fetchData();
    }, 5000);
  }

  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };

  fetchData = async () => {
    const q = [...this.state.q];
    const data = await this.props.fetch()
      .catch(snackbar => this.setState({ snackbar }));
    if(data && data.length > 0) {
      q.push(data);
      this.setState({ q });
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { classes, t } = this.props;
    const { snackbar, q } = this.state;
    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Mail queue")}
          </Typography>
          <div className={classes.logViewer}>
            <Paper elevation={1} className={classes.paper}>
              {q.length === 0 && <Typography>&lt;no logs&gt;</Typography>}
              {q.map(({postfixMailq, gromoxMailq}, idx) => <>
                <pre
                  key={idx}
                  className={classes.log}
                >
                  {postfixMailq}
                </pre>
                <pre
                  key={idx}
                  className={classes.log}
                >
                  {gromoxMailq}
                </pre>
                <Divider />
              </>
              )}
            </Paper>
          </div>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: "" })}
          />
        </div>
      </div>
    );
  }
}

Status.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchVhostStatus: PropTypes.func.isRequired,
  vhosts: PropTypes.array.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async () => await dispatch(fetchMailQData())
      .catch((error) => Promise.reject(error)),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Status)));
