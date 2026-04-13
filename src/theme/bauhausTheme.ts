import { createTheme } from '@mui/material/styles'

const ink = '#121212'
const canvas = '#F0F0F0'
const paper = '#ffffff'
const red = '#D02020'
const blue = '#1040C0'
const yellow = '#F0C020'
const hardSm = '4px 4px 0px 0px #121212'
const hardLg = '8px 8px 0px 0px #121212'

export const bauhausTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: red, contrastText: '#ffffff' },
    secondary: { main: blue, contrastText: '#ffffff' },
    error: { main: red },
    warning: { main: yellow },
    info: { main: blue },
    success: { main: ink },
    background: { default: canvas, paper },
    text: { primary: ink, secondary: ink },
    divider: ink,
    action: {
      active: ink,
      hover: 'rgba(18, 18, 18, 0.06)',
      selected: 'rgba(240, 192, 32, 0.35)',
    },
  },
  typography: {
    fontFamily: '"Outfit", system-ui, sans-serif',
    h6: {
      fontWeight: 900,
      letterSpacing: '-0.03em',
      lineHeight: 0.95,
      textTransform: 'uppercase',
    },
    subtitle1: { fontWeight: 800, letterSpacing: '-0.02em' },
    subtitle2: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' },
    body1: { fontWeight: 500 },
    body2: { fontWeight: 500 },
    caption: { fontWeight: 500 },
    button: {
      fontWeight: 800,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: canvas,
          color: ink,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0, square: true },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `4px solid ${ink}`,
          boxShadow: hardLg,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'secondary' },
      styleOverrides: {
        root: {
          backgroundColor: blue,
          color: '#ffffff',
          borderBottom: `4px solid ${ink}`,
          boxShadow: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 72,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 9999,
          border: `2px solid ${ink}`,
          boxShadow: hardSm,
          transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, background-color 200ms ease-out',
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: 'none',
          },
        },
        outlined: {
          backgroundColor: paper,
          color: ink,
          '&:hover': { backgroundColor: paper, filter: 'brightness(0.97)' },
        },
        text: {
          border: 'none',
          boxShadow: 'none',
          borderRadius: 0,
          minWidth: 0,
          '&:hover': { backgroundColor: 'rgba(18, 18, 18, 0.06)' },
          '&:active': {
            transform: 'none',
            boxShadow: 'none',
          },
        },
        sizeSmall: {
          paddingLeft: 14,
          paddingRight: 14,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          border: `2px solid ${ink}`,
          boxShadow: hardSm,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: paper,
          '& fieldset': {
            borderWidth: 2,
            borderColor: ink,
          },
          '&:hover fieldset': {
            borderColor: ink,
          },
          '&.Mui-focused fieldset': {
            borderWidth: 2,
            borderColor: ink,
          },
        },
        input: {
          fontWeight: 500,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: ink,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          '&.Mui-focused': { color: ink },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: ink,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          marginLeft: 0,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: ink,
          '&.Mui-checked': { color: red },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: ink,
          '&.Mui-checked': { color: red },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: `2px solid ${ink} !important`,
          borderRadius: '0 !important',
          color: ink,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          backgroundColor: paper,
          '&.Mui-selected': {
            backgroundColor: `${yellow} !important`,
            color: `${ink} !important`,
          },
          '&.Mui-disabled': {
            borderColor: `${ink} !important`,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 0,
          flexWrap: 'wrap',
          boxShadow: hardSm,
        },
        grouped: {
          border: 'none',
          '&:not(:first-of-type)': {
            marginLeft: 0,
            borderLeft: `2px solid ${ink}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid ${ink}`,
          fontWeight: 700,
          backgroundColor: paper,
          boxShadow: '2px 2px 0px 0px #121212',
        },
        deleteIcon: {
          '&:hover': { color: red },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          border: `2px solid ${ink}`,
          boxShadow: hardLg,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: ink,
        },
      },
    },
  },
})
