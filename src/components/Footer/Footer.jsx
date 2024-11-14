import React from "react";

const Footer = () => {
  const appVersion =
    import.meta.env.VITE_APP_VERSION || "Versione non disponibile";

  return (
    <footer
      style={{
        marginBottom: "1.5rem",
        textAlign: "center",
        color: "var(--text-color)",
        fontSize: "0.8rem",
      }}
    >
      <p>Versione {appVersion}</p>
    </footer>
  );
};

export default Footer;
