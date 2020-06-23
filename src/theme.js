import { createMuiTheme } from '@material-ui/core/styles';

import grey from './colors/grey';
import brightBlue from './colors/brightBlue';

const theme = createMuiTheme({
  overrides: {
    MuiAppBar: {
      positionAbsolute: {
        boxShadow: 'none',
      },
    },
    MuiTableCell: {
      head: {
        backgroundColor: grey['900'],
        color: 'white',
      },
    },
    MuiTableRow: {
      root: {
        "&:nth-child(odd)": {
          backgroundColor: '#f0f0f0',
        },
        '&$hover': {
          "&:hover": {
            backgroundColor: '#e0e0e0',
          },
        },
        '&$selected': {
          backgroundColor: brightBlue['300'],
        },
      },
    },
    MuiGridListTile: {
      tile: {
        display: 'flex',
        flex: 1,
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: 14,
      },
    },
  },
});

export default theme;
