const getList = async () => {
    let url = 'http://127.0.0.1:5000/glicoses';
    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        data.glicoses.forEach(item => glicosesList(item.id, item.nome, item.glicose, item.inclusao_data));

        // Chama a função para verificar o cadastro mais recente
        verificarCadastroMaisRecente(data.glicoses);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Função para inserir itens na lista
const glicosesList = (id, nome, glicose, inclusao_data) => {
    const cardsContainer = document.getElementById('cards'); // A div onde os cards serão inseridos
    const maxItems = 4; // Número máximo de itens
    const currentItems = Array.from(cardsContainer.children); // Itens atuais no container

    // Cria um novo card
    const card = document.createElement('div');
    card.className = 'card'; // Classe para estilo

    // Formata a data para o formato local
    const utcDate = new Date(inclusao_data).toLocaleString('pt-br', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Inserir um card com os dados
    card.innerHTML = `
        <button class="card__delete-button" onclick="deleteItem(${id})">X</button>
        <div class="card__header">
            <img src="images/icons/glicose.svg" alt="glicose" class="card__icon">
            <h2 class="card__title">Blood Sugar</h2>
        </div>
        <p class="card__value">${glicose} mg/dl</p>
        <p class="card__name">${nome}</p>
        <p class="card__date">${utcDate}</p>
        <p class="card__status">${glicose < 100 ? "normal" : "Atenção"}</p>
        <img src="images/icons/grafic.svg" alt="grafic">
    `;

    // Adiciona o card ao container
    cardsContainer.appendChild(card);

    // Se o número de itens exceder o máximo, remove o mais antigo.
    // É feito dessa forma para facilitar a visualização do usuário, poderá ser alterado futuramente com novas regras de negocio.
    if (currentItems.length >= maxItems) {
        cardsContainer.removeChild(currentItems[0]); // Remove o primeiro (mais antigo)
    }
};


// Função para verificar a última data de cadastro
const verificarCadastroMaisRecente = (glicosesList) => {
    const footer = document.getElementById('footer');

    if (glicosesList.length === 0) {
        footer.innerHTML = 'Nenhuma glicose cadastrada.';
        footer.style.color = 'black'; // Cor neutra
        return;
    }

    // Encontra o item mais recente
    const glicoseMaisRecente = glicosesList.reduce((latest, item) => {
        return new Date(item.insertion_date) > new Date(latest.insertion_date) ? item : latest;
    });

    const dataGlicoseMaisRecente = new Date(glicoseMaisRecente.insertion_date);
    const dataAtual = new Date();
    const diferencaDias = Math.abs(dataAtual - dataGlicoseMaisRecente) / (1000 * 60 * 60 * 24);

    if (diferencaDias > 1) {
        footer.innerHTML = 'Atenção! Você não cadastrou sua glicose hoje.';
        footer.style.color = 'red'; // Destaque em vermelho
    } else {
        footer.innerHTML = 'Glicose cadastrada hoje.';
        footer.style.color = 'green'; // Destaque em verde
    }
};

// Chamada da função para buscar e adicionar os cards
getList();

// Adicionar a data de hoje na tela.
const datahoje = document.getElementById('dataHoje');
const data = new Date();
const dia = data.getDate().toString().padStart(2, '0');
const mesNomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const mes = mesNomes[data.getMonth()];
const ano = data.getFullYear();
datahoje.textContent = `${dia} de ${mes} de ${ano}`;

// Função para remover o card correspondente a um item pelo ID
const removeCard = (itemId) => {
    // Seleciona o botão de delete pelo atributo 'onclick' e acessa o elemento pai (card)
    const card = document.querySelector(`.card__delete-button[onclick="deleteItem(${itemId})"]`).parentElement;
    if (card) {
        card.remove(); // Remove o card da página
    }
}

// Função para deletar um item com base no ID
const deleteItem = (itemId) => {
    // Monta a URL da API, passando o ID como parâmetro
    let url = 'http://127.0.0.1:5000/glicose?id=' + itemId;
    
    // Faz uma requisição DELETE para a API
    fetch(url, {
        method: 'DELETE'
    })
    .then((response) => {
        response.json(); 
        removeCard(itemId); // Remove o card correspondente ao item deletado
        getList(); // Atualiza a lista de itens
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Adiciona um listener no botão de cadastro para abrir o modal
document.querySelector('.btn-cadastrar').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'block'; // Exibe o modal
});

// Adiciona um listener no botão de fechar para esconder o modal
document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none'; // Esconde o modal
});


window.addEventListener('click', function (event) {
    // Verifica se o alvo do clique é o elemento com ID 'modal'
    if (event.target == document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none'; // Fecha o modal ao clicar fora dele
    }
});


document.getElementById('formCadastrar').addEventListener('submit', function (event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário (envio e recarregamento da página)
    postItem(); // Chama a função que realiza a ação de envio de dados
    document.getElementById('modal').style.display = 'none'; // Fecha o modal após o envio dos dados
});


function postItem() {
    // Obter os valores dos campos do formulário
    const formData = new FormData();
    formData.append('nome', document.getElementById('name').value);
    formData.append('glicose', document.getElementById('glucose').value);

    // Enviar os dados usando fetch
    fetch('http://127.0.0.1:5000/glicose', {
        method: 'post',
        body: formData
    })
        .then(response => response.text())  // Alterado para response.text()
        .then(data => {
            // Chamada da função para buscar e adicionar os cards
            getList();
            console.log('Success:', data);

            // Limpar o formulário após o cadastro
            document.getElementById('name').value = '';
            document.getElementById('glucose').value = '';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}