// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import TableViewContainer from "../components/TableViewContainer";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from "../proptypes/defaultTableProptypes";
import { getSpamData, getSpamThroughput } from "../actions/spam";
import { Paper } from "@mui/material";
import SpamDonut from "../components/charts/SpamDonut";
import { useDispatch } from "react-redux";
import SpamThroughput from "../components/charts/SpamThroughput";


const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
});

const Spam = props => {
  const { t, tableState, clearSnackbar } = props;
  const { loading, snackbar } = tableState;
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
    const fetchInterval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      clearInterval(fetchInterval);
    }
  }, []);

  const fetchData = () => {
    dispatch(getSpamThroughput());
  }

  return (
    <TableViewContainer
      headline={t("Spam")}
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <Paper>
        <SpamDonut />
      </Paper>
      <Paper>
        <SpamThroughput />
      </Paper>
    </TableViewContainer>
  );
}

Spam.propTypes = {
  spam: PropTypes.object.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = (state) => {
  return { spam: state.spam };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTableData: async (params) => {
      await dispatch(getSpamData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Spam);
