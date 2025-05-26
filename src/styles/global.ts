import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  :root {
    --font: --apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;

    --brand: #4c5ea8; /* ещё светлее, мягкий slate-синий */
    --border-color: #6877b4; /* более светлый, неброский */

    --scrollbar-thin-thumb: #8390c9; /* светло-синий, не ядовитый */
    --scrollbar-thin-track: transparent;

    --sidebar-text-normal: #c8d0ec; /* очень мягкий, но не белый */
    --sidebar-text-muted: #94a0d0;  /* чуть светлее и теплее muted */

    --sidebar-background: #232d50;        /* светлее, но глубокий фон */
    --sidebar-background-hover: #314177;  /* hover с индиго-оттенком */
    --sidebar-background-active: #4c5ea8; /* активный — подчёркнутый, но не кричащий */

    --notelist-background: #f5f5f4;
    --danger: #cc4539;
  }

  

  body {
    font-family: var(--font);
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;
