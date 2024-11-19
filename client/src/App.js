import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import {
  THEME_ID as MATERIAL_THEME_ID,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  experimental_extendTheme as materialExtendTheme,
  ThemeProvider,
} from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import './App.css';
import AppRoutes from './routes';

// Extend the Material theme
const materialTheme = materialExtendTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            color: 'black',
          },
          '& .MuiInputLabel-root': {
            color: 'gray',
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            '& fieldset': {
              borderColor: 'gray',
            },
            '&:hover fieldset': {
              borderColor: '#011929',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#011929',
            },
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#011929', // Dark Blue
      light: '#0380d0', // Light Blue
    },
    secondary: {
      main: '#f50057', // Pink
    },
    mode: 'dark', // Use 'mode' instead of 'type' (deprecated)
  },
  typography: {
    h1: {
      fontFamily: 'Cinzel',
      fontSize: '2rem',
    },
    fontFamily: 'Playfair Display',
  },
  breakpoints: {
    values: {
      sm: 640,
      md: 1325,
      lg: 1280,
      xl: 1536,
    },
  },
});

// Standard Material theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#011929',
//       light: '#0380d0',
//     },
//     secondary: {
//       main: '#f50057',
//     },
//     mode: 'dark',
//   },
// });

function App() {
  return (
    <div className='App'>
      <SnackbarProvider maxSnack={3}>
        {/* Material theme is provided via MaterialCssVarsProvider */}
        <MaterialCssVarsProvider
          theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
          {/* Joy UI theme provider */}
          <JoyCssVarsProvider>
            {/* Material-UI ThemeProvider */}
            <ThemeProvider theme={materialTheme}>
              <AppRoutes />
            </ThemeProvider>
          </JoyCssVarsProvider>
        </MaterialCssVarsProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;
