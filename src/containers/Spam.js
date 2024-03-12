// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from "react";
import PropTypes from "prop-types";
import TableViewContainer from "../components/TableViewContainer";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from "../proptypes/defaultTableProptypes";
import { getSpamData } from "../actions/spam";
import { Paper } from "@mui/material";
import SpamDonut from "../components/charts/SpamDonut";


const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
});

const Spam = props => {
  const { t, tableState, clearSnackbar} = props;
  const { loading, snackbar, } = tableState;

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
