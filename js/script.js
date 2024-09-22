const getList = async () => {
    let url = 'http://127.0.0.1:5000/glucoses';
    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        data.glucoses.forEach(item => glicosesList(item.id, item.name, item.glucose, item.insertion_date));

        // Chama a função para verificar o cadastro mais recente
        verificarCadastroMaisRecente(data.glucoses);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Função para inserir itens na lista
const glicosesList = (id, name, glucose, insertion_date) => {
    const cardsContainer = document.getElementById('cards'); // A div onde os cards serão inseridos
    const maxItems = 4; // Número máximo de itens
    const currentItems = Array.from(cardsContainer.children); // Itens atuais no container

    // Cria um novo card
    const card = document.createElement('div');
    card.className = 'card'; // Classe para estilo

    // Formata a data para o formato local
    const utcDate = new Date(insertion_date).toLocaleString('pt-br', {
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
        <button class="card__delete-button">X</button>
        <div class="card__header">
            <img src="images/icons/glicose.svg" alt="glicose" class="card__icon">
            <h2 class="card__title">Blood Sugar</h2>
        </div>
        <p class="card__value">${glucose} mg/dl</p>
        <p class="card__name">${name}</p>
        <p class="card__date">${utcDate}</p>
        <p class="card__status">${glucose < 100 ? "normal" : "Atenção"}</p>
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

const removeElement = () => {
    let closeButtons = document.getElementsByClassName("card__delete-button");
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = function () {
            let card = this.parentElement;
            if (confirm("Você tem certeza?")) {
                card.remove();
                alert("Removido!");
            }
        }
    }
}

// Chama a função para adicionar o evento de remoção aos botões de delete
removeElement();

const deleteItem = (item) => {
    console.log(item)
    let url = 'http://127.0.0.1:5000/produto?nome=' + item;
    fetch(url, {
      method: 'delete'
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error:', error);
      });
  }