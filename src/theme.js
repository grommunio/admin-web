import { createMuiTheme } from '@material-ui/core/styles';

import grey from './colors/grey';
import blue from './colors/blue';

const mode = window.localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light';

const theme = createMuiTheme({
  overrides: {
    MuiPaper: {
      elevation1: {
        boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.06),0px 6px 10px 0px rgba(0, 0, 0, 0.042),0px 1px 18px 0px rgba(0, 0, 0, 0.036)',
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: mode === 'light' ? '#fff' : blue[700],
        color: mode === 'light' ? '#333' : '#fff',
        boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.06),0px 8px 10px 1px rgba(0, 0, 0, 0.042),0px 3px 14px 2px rgba(0, 0, 0, 0.036)',
      },
    },
    MuiTableCell: {
      head: {
        padding: '12px 16px',
      },
      body: {
        padding: '20px 16px',
        border: 'none',
      },
    },
    MuiTableRow: {
      hover: {
        '&:hover': {
          backgroundColor: '#ddd',
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
  palette: {
    type: mode,
    primary: blue,
    secondary: grey,
    background: {
      paper: mode === 'light' ? '#fff' : '#2b3559',
    },
  },
});

export default theme;
