// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import PropTypes from 'prop-types';

const defaultTableProptypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetchTableData: PropTypes.func.isRequired,
  handleRequestSort: PropTypes.func.isRequired,
  handleMatch: PropTypes.func.isRequired,
  tableState: PropTypes.object.isRequired,
  handleAdd: PropTypes.func.isRequired,
  handleAddingClose: PropTypes.func.isRequired,
  handleAddingSuccess: PropTypes.func.isRequired,
  handleAddingError: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleDeleteSuccess: PropTypes.func.isRequired,
  handleDeleteClose: PropTypes.func.isRequired,
  handleDeleteError: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};

export default defaultTableProptypes;
