// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import { withTranslation } from "react-i18next";
import { Paper, Typography } from "@mui/material";
import { connect } from "react-redux";
import { fetchMailQData } from "../actions/mailq";
import TableViewContainer from "../components/TableViewContainer";

const styles = (theme) => ({
  logViewer: {
    flex: 1,
  },
  log: {
    fontSize: 16,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  paper: {
    flex: 1,
    padding: theme.spacing(2, 2, 2, 2),
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  header: {
    marginBottom: 8,
  },
});

class MailQ extends PureComponent {

  state = {
    postfixMailq: '',
    gromoxMailq: '',
    snackbar: '',
  };

  fetchInterval = null;

  async componentDidMount() {
    this.fetchData();
    this.fetchInterval = setInterval(() => {
      this.fetchData();
    }, 10000);
  }

  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };

  fetchData = async () => {
    const data = await this.props.fetch()
      .catch(snackbar => this.setState({ snackbar }));
    if(data) {
      this.setState({ ...data });
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { classes, t } = this.props;
    const { snackbar, postfixMailq, gromoxMailq } = this.state;
    return (
      <TableViewContainer
        headline={t("Mail queue")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >  
        <div className={classes.logViewer}>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.header}>Postfix {t("mail queue")}</Typography>
            <pre
              className={classes.log}
            >
              {postfixMailq}
            </pre>
          </Paper>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.header}>Gromox {t("mail queue")}</Typography>
            <pre
              className={classes.log}
            >
              {gromoxMailq}
            </pre>
          </Paper>
        </div>
      </TableViewContainer>
    );
  }
}

MailQ.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
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
)(withTranslation()(withStyles(styles)(MailQ)));
