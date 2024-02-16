// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import { TableCell } from '@mui/material';
import { withStyles } from '@mui/styles';

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.primary['100'],
    border: '1px solid white',
    color: 'black',
  },
}))(TableCell);

export default StyledTableCell;