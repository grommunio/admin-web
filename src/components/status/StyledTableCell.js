// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { TableCell } from '@mui/material';
import { withStyles } from '@mui/styles';

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: '#C9E7FF',
    border: '1px solid white',
    color: 'black',
  },
}))(TableCell);

export default StyledTableCell;