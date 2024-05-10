// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import { TableRow } from "@mui/material";
import { withStyles } from 'tss-react/mui';

const AlternatingTableRow = withStyles(TableRow, (theme) => ({
  root: {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export default AlternatingTableRow;