/** Where the user's theme choice is kept; absent, the system preference applies */
export const THEME_KEY = "theme";

/* Runs inline before first paint, so a saved theme never flashes the other one */
export const THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
