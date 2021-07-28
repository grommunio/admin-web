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
import { fetchMailQData } from "../actions/mailq";
import TableViewContainer from "../components/TableViewContainer";

const styles = (theme) => ({
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
  paper: {
    flex: 1,
    padding: theme.spacing(2),
  },
});

class MailQ extends PureComponent {

  state = {
    q: [],
    snackbar: '',
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
      <TableViewContainer
        headline={t("Mail queue")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >  
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
