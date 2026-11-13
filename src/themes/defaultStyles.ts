import { ThemeMode } from "./types";


const defaultStyles = (mode: ThemeMode) => ({
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        color: mode === 'light' ? '#333' : '#fff',
        //backgroundColor: '#ffffff', 
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        overflow: 'hidden',
        borderRadius: 4,
        border: '1px solid ' + (mode === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'),
        boxShadow: mode === 'light'
          ? '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 14px rgba(15, 23, 42, 0.05)'
          : '0 1px 2px rgba(0, 0, 0, 0.24), 0 4px 14px rgba(0, 0, 0, 0.28)',
        transition: 'box-shadow 0.2s ease',
      },
      elevation1: {
        borderRadius: 8,
        margin: 16,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      contained: {
        '&.MuiButton-colorSecondary': {
          background: 'linear-gradient(150deg, #FF512F, #DD2476)',
          color: '#fff',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        padding: '10px 16px',
      },
      body: {
        border: 'none',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      hover: {
        '&:hover': {
          backgroundColor: mode === 'light' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.06)',
          cursor: 'pointer',
        },
      },
      root: {
        transition: 'background-color 0.12s ease',
        '&:nth-of-type(even)': {
          backgroundColor: mode === 'light' ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255, 255, 255, 0.03)',
        },
      },
    },
  },
  MuiGridListTile: {
    styleOverrides: {
      tile: {
        display: 'flex',
        flex: 1,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: 14,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: mode === 'light' ? '#333' : '#ddd',
      },
    },
  },
});

export default defaultStyles;