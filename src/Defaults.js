import { createGlobalStyle } from "styled-components";

const Defaults = createGlobalStyle`
    :root {
      --font-primary: "Space Mono";
    
      --color-accent-one: #7415f9;
      --color-accent-two: #ed0cef;
      --color-accent-three: #1caeb0;
      --color-background: #151d1e;
      --color-text: #ffffff;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 62.5%;
    }

    body {
      position: relative;
      background-color: var(--color-background);
    }

    ul {
      list-style: none;
    }

    button {
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    a {
      color: inherit;
      text-decoration: none;
    }
`;

export default Defaults;
