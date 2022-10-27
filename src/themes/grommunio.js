import blue from "../colors/blue";
import grey from "../colors/grey";
import red from "../colors/red";
import defaultStyles from "./defaultStyles";

const grommunioTheme = mode => ({
  components: {
    ...defaultStyles(mode),
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: mode === 'light' ? '#fff' : blue[600],
          color: mode === 'light' ? '#333' : '#fff',
          boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.06),0px 8px 10px 1px rgba(0, 0, 0, 0.042),0px 3px 14px 2px rgba(0, 0, 0, 0.036)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(150deg, rgb(0, 159, 253), rgb(42, 42, 114))',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorSecondary: {
          backgroundColor: red['500'],
          color: '#000',
        },
        colorPrimary: {
          backgroundColor: blue['300'],
          color: '#000',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            background: `linear-gradient(150deg, ${blue['400']}, #2d323b)`,
            color: '#fff',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.06), 0px 8px 10px 1px rgba(0, 0, 0, 0.042), 0px 3px 14px 2px rgba(0, 0, 0, 0.036)',
    
          '&.Mui-disabled': {
            background: 'linear-gradient(#e0e0e0, #e0e0e0)',
            color: '#999',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(150deg, rgb(0, 159, 253), rgb(42, 42, 114))',
        },
        containedSecondary: {
          background: 'linear-gradient(150deg, #FF512F, #DD2476)',
          color: '#fff',
        },
      },
    },
  },
  typography: {
    h1: {
      color: mode === 'light' ? '#333' : '#fff',
      fontSize: '2em',
      fontWeight: 'bold',
    },
    h2: {
      color: mode === 'light' ? '#333' : '#fff',
      fontSize: '1.5em',
      fontWeight: 'bold',
    },
    caption: {
      color: mode === 'light' ? '#000' : '#fff',
    },
  },
  palette: {
    mode: mode,
    primary: blue, 
    secondary: grey,
    ...(mode === 'light' ?
      {
        text: {
          primary: mode === 'light' ? '#000' : '#fff',
        },
      } :
      {
        background: {
          paper: "#121315",
        }
      }),
  },
});

export default grommunioTheme;