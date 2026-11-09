import React from "react";
import GeralScreen from "../Geral/index.jsx";

// O administrador tem as mesmas funções do usuário Geral (mural + Visualizar Salas + Itens pendentes).
// Reutiliza a própria tela, então qualquer ajuste feito no Geral vale também para o admin.
export default function AdministracaoScreen() {
    return <GeralScreen />;
}
