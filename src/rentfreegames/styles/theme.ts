import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface PaletteOptions {
        custom?: {
            light: React.CSSProperties['color'],
            main: React.CSSProperties['color'],
            dark: React.CSSProperties['color'],
            contrastText: React.CSSProperties['color'],
        };
    }
}

// #ffd42a, #9955ff, #CBC5EA, #61c9a8, #01161e
const dark = '#13293D';

export const theme = createTheme({
    palette: {
        primary: {
            light: '#CBC5EA',
            main: '#9955ff',
            dark: dark,
            contrastText: '#fff',
        },
        secondary: {
            light: '#ffd42a',
            main: '#61c9a8',
            dark: dark,
            contrastText: '#000',
        },
        background: {
            default: '#01161e',
            paper: '#01161e'
        },
        mode: 'dark',
        // Used by `getContrastText()` to maximize the contrast between
        // the background and the text.
        contrastThreshold: 3,
        // Used by the functions below to shift a color's luminance by approximately
        // two indexes within its tonal palette.
        // E.g., shift from Red 500 to Red 300 or Red 700.
        tonalOffset: 0.2,
    },
    components: {
        // Name of the component
        MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: {
                  // Some CSS
                  "&:hover": {
                    backgroundColor: dark,
                  },
                },
              },
        },
      },
});
