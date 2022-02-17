/* eslint-disable no-undef */
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import { Typography } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const About = ({ about }) => {
  const { API, backend, schema } = about;

  return <div>
    <Typography variant="h6">Versions</Typography>
    <Typography>UI: {process.env.REACT_APP_BUILD_VERSION}</Typography>
    <Typography>API: {API}</Typography>
    <Typography>Backend: {backend}</Typography>
    <Typography>Database: {schema}</Typography>
  </div>;
};

About.propTypes = {
  about: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    about: state.about,
  };
};

export default connect(mapStateToProps)(About);