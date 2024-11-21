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
              borderColor: '#103783',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#103783',
            },
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#103783', // Dark Blue (from logo)
      light: '#9BAFD9', // Light Blue (from logo)
      contrastText: '#FFFFFF', // White text for better contrast
    },
    secondary: {
      main: '#f50057', // Pink (unchanged)
    },
    background: {
      default: '#F5F5F5', // Light gray for better contrast
      paper: '#FFFFFF', // White for card backgrounds
    },
    text: {
      primary: '#103783', // Use dark blue for primary text
      secondary: '#9BAFD9', // Use light blue for secondary text
    },
    mode: 'light', // Updated to light mode for better contrast
  },
  typography: {
    h1: {
      fontFamily: 'Cinzel',
      fontSize: '2rem',
    },
    fontFamily: 'Playfair Display',
  },
});

function App() {
  return (
    <div className='App'>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={2000}>
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
