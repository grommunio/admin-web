const defaultStyles = mode => ({
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        color: mode === 'light' ? '#333' : '#fff',
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
      },
      elevation1: {
        borderRadius: 8,
        margin: 16,
        boxShadow: mode === 'light' ? '0px 3px 3px -2px rgba(0, 0, 0, 0.06),0px 3px 4px 0px rgba(0, 0, 0, 0.042),0px 1px 8px 0px rgba(0, 0, 0, 0.036)' : '0 0 1px 0 rgba(0,0,0,0.70), 0 3px 4px -2px rgba(0,0,0,0.50)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      containedSecondary: {
        background: 'linear-gradient(150deg, #FF512F, #DD2476)',
        color: '#fff',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        height: '30px',
        padding: '10px 16px',
      },
      body: {
        height: '40px',
        border: 'none',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      hover: {
        '&:hover': {
          backgroundColor: '#ddd',
          cursor: 'pointer',
        },
      },
      root: {
        '&:nth-of-type(even)': {
          backgroundColor: mode === 'light' ? '#eee' : '#202329',
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