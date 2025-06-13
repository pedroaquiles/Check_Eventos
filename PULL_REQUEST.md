# CheckEvents

Sua ferramenta inteligente para gerenciar e visualizar eventos importados, com controle de visualização e relatórios.

## Visão Geral

Este projeto é uma aplicação web front-end desenvolvida com HTML, CSS e JavaScript puro, projetada para gerenciar uma lista de eventos. A aplicação permite autenticação de usuários, importação de eventos de uma API externa, marcação de eventos como "vistos" ou "não vistos" e geração de relatórios baseados nos eventos visualizados, com filtros de ordenação.

## Tecnologias Utilizadas

* **HTML5**
* **CSS3**
* **JavaScript**
* **LocalStorage**:
* **Node.js/Express (`server.js`)**: Servidor proxy local para contornar problemas de CORS durante o desenvolvimento.
* **http-proxy-middleware**: Middleware para o proxy no Express.
* **cors**: Middleware para habilitar CORS no proxy.


## Decisões feitas na confecção do Projeto

### 1. **Modularização do Código JavaScript**

* O código JavaScript foi modularizado. Cada funcionalidade foi encapsulada em seu próprio arquivo na pasta `modules/`.
* O `app.js` atua como o "orquestrador", importando e inicializando os módulos, e gerenciando as transições entre as telas através de callbacks.

### 2. **Modularização dos Estilos CSS**

* O CSS foi dividido em arquivos menores com base em sua funcionalidade, dentro da pasta `.styles/`. O arquivo `style.css` importa esses arquivos usando `@import`.
* Isso garante escalabilidade, legibilidade e facilita a manutenção.

### 3. **Servidor Proxy Local para circundar problemas com CORS**

* Requisições de frontend para uma API em um domínio diferente são bloqueadas pela política de CORS.
* Foi feito um servidor Node.js (`server.js`) utilizando `express` e `http-proxy-middleware`. O frontend faz requisições para `http://localhost:3000/api/`, e o proxy as encaminha para a API externa. Permitindo o desenvolvimento local sem desabilitar a segurança do navegador.

### **DEPLOYMENT na plataforma Vercel**:
* O Vercel serve arquivos frontend como arquivos estáticos, não possui hambiente Node.js rodando o `server.js` como um proxy para interceptar requisições. Logo quando o front hospedado no Vercel tenta fazer uma requisição para `http://localhost:3000/api/...` a conexão é falha pois ele está tentando se conectar a um servidor que não existe no Vercel.
* Para deployment no Vercel, foi criado o arquivo `vercel.json` contendo regras de `rewrites` para funcionar como um proxy reverso diretamente no servidor do Vercel, eliminando a necessidade de rodar um servidor Node.js separado para o proxy.
* Juntamente com a alteração no arquivo `app.js` para apontar para a própria URL de deployment no Vercel. Alterando o cont API_BASE_URL para (' ').

### 4. **Gerenciamento de Eventos Vistos**

* O estado "visto/não visto" de cada evento é persistido no `localStorage`. Um `Set` é usado para armazenar os `idEvent` dos eventos vistos para acesso rápido.
* Os eventos vistos são dispostos no Relatório de Eventos Vistos após o check-box de Eventos Vistos ser selecionado.

### 5. **Formatação de Datas para Requisição**

* A API de eventos exige um formato de data `YYYY-MM-DD HH:MM:SS` para os parâmetros `startDate` e `endDate` na URL.
* Foi criada uma função auxiliar (`formatDateTimeForAPI`) para converter objetos `Date` (obtidos dos inputs `datetime-local`) para este formato exato, sem o `T` (após ano-mês-dia) ou o `Z` (após horas-minutos-segundos).

### 6. **Responsividade**

* A estilização CSS foi desenvolvida com a metodologia **Mobile-First**, priorizando a aparência e o comportamento em telas menores e, em seguida, aplicando regras específicas para telas maiores usando `@media queries`.

#### Detalhes
* Em mobile, a navbar apresenta um ícone que, ao ser clicado, revela um **menu lateral** que desliza da direita para a esquerda e escurece o restante da tela com um overlay. No desktop, a navbar exibe o botão de login diretamente.
* Foram usados `flexbox` e `grid` para organizar o conteúdo de forma fluida.
* Foram feitos ajustes de tamanho e espaçamento para garantir usabilidade em dispositivos touch.

### 7. **Navegação de telas**

* A navegação entre as telas é gerenciada pelo `app.js` através da função `showScreen()` e callbacks passados entre os módulos.
* A tela de eventos importados exibe checkboxes para marcar eventos como vistos. Esses eventos marcados são listados em uma tela de relatório separada, onde podem ser filtrados. Ao clicar em um item da lista, a tela de detalhes é exibida.


# Como Rodar a Aplicação Localmente

No ambiente de desenvolvimento local

**Foi instalado as Dependências do Proxy:**
    Com o terminal na pasta `.\server`
    executando:
    ```
    npm install express http-proxy-middleware cors
    ```
    Necessário ter o Node.js e o npm instalados em na máquina.

Para rodar o CheckEvents siga os passos abaixo:

1.  **Inicie o Servidor Proxy:**
    Abra um terminal na pasta raiz do projeto (pasta `.\server`)
     e execute:
    ```
    node server.js
    ```
    Este servidor rodará por padrão na porta `3000` e atuará como um proxy para a API externa, evitando problemas de CORS. Mantenha este terminal aberto enquanto usa a aplicação.

2.  **Inicie o Servidor HTTP para o Frontend:**
    Abra um segundo terminal na pasta raiz do projeto (pasta `.\Check_Events-main`)
     e execute:
    ```
    http-server
    ```
    (se não tiver o `http-server` globalmente, instale-o com `npm install -g http-server`):

    Este servidor servirá os arquivos frontend.

3.  **Acesse a Aplicação:**
    Abra seu navegador e navegue para a URL fornecida pelo `http-server`.
    Ou selecione um dos links abaixo de "Available on:", segurando CTRL no teclado e apertando o botão do mouse.

## Credenciais usadas para testar a API de login

* Credenciais usadas:`{ "login": "samir_megamart", "password": "q9I5wTM6" }`

* Durante o desenvolvimento local, as requisições do frontend serão direcionadas para `http://localhost:3000/api/...`, que é o proxy para a API externa.
