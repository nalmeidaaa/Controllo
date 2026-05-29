# Conclusão dos requisitos:

RF-004 | O sistema deve permitir que administradores realizem o cadastro de usuários
RF-005 | O sistema deve permitir que administradores realizem a edição de usuários
RF-006 | O sistema deve permitir que administradores realizem a exclusão de usuários
RF-007 | O sistema deve controlar níveis de acesso conforme o perfil do usuário (administrador, manutenção, docente, entre outros)

## Como testar?

### Passo 1:
No Insomnia, com a mesma rota presente nesse mesmo docs, é possível gerar um token de usuário.
No banco de dados local, é possível gerar um token com o seguinte login de teste:

{
  "login": "admin@controllo.com",
  "senha": "1234"
}

Mas, não é possível usar esse login em outro servidor que não seja o mesmo servidor local do desenvolvimento, portanto para testar você deve criar o banco de dados em sua máquina e fazer o insert de um usuário com o tipo de usuário "Administracao"

### Passo 2:
Agora, com o token gerado, na aba "Auth", do Insomnia, escolha o "Bearer Token" na setinha e insira o token gerado, em alguma rota qualquer de usuário do Insomnia.

### Passo 3:
Faça o teste.