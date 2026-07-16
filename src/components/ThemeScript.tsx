const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem("nebula-theme");
    var theme = stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

/** Sets the theme attribute before first paint so switching modes never flashes the wrong palette. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
