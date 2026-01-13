// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Paper } from "@mui/material"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSpamData } from "../actions/spam";
import PropTypes from 'prop-types';

const SpamStatus = ({ setSnackbar }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSpamData()).catch(setSnackbar);
  }, []);

  return <Paper>

  </Paper>
}

SpamStatus.propTypes = {
  setSnackbar: PropTypes.func.isRequired,
}

export default SpamStatus;
