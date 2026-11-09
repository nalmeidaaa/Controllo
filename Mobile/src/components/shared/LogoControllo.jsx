import React from "react";
import { SvgXml } from "react-native-svg";
import { useTema } from "../../theme/tema.jsx";
import { LOGO_CLARO, LOGO_ESCURO } from "../../assets/logos.js";

// Logo do Controllo no mesmo critério do front-end: controllo.svg no tema escuro,
// controlloalt.svg no tema claro
export default function LogoControllo({ tamanho = 36 }) {
    const { escuro } = useTema();

    return (
        <SvgXml
            xml={escuro ? LOGO_ESCURO : LOGO_CLARO}
            width={tamanho}
            height={tamanho}
        />
    );
}
