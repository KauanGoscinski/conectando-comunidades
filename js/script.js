let todosServicos = [];
let servicosFiltrados = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarServicos();
    configurarEventos();
});

async function carregarServicos() {
    try {
        const response = await fetch('data/servicos.json');
        const data = await response.json();
        todosServicos = data.servicos;
        servicosFiltrados = todosServicos;
        renderizarServicos(servicosFiltrados);
    } catch (erro) {
        console.error('Erro ao carregar serviços:', erro);
        mostrarErro();
    }
}

function configurarEventos() {
    const inputBusca = document.getElementById('input-busca');
    const btnBusca = document.getElementById('btn-busca');
    
    inputBusca.addEventListener('input', (e) => realizarBusca(e.target.value));
    btnBusca.addEventListener('click', () => realizarBusca(inputBusca.value));
    
    const btnsFiltro = document.querySelectorAll('.btn-filtro');
    btnsFiltro.forEach(btn => {
        btn.addEventListener('click', () => filtrarPorCategoria(btn));
    });
    
    const modal = document.getElementById('modal-tutorial');
    const btnFechar = document.querySelector('.btn-fechar');
    
    btnFechar.addEventListener('click', () => fecharModal());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

function renderizarServicos(servicos) {
    const grid = document.getElementById('servicos-grid');
    
    if (servicos.length === 0) {
        grid.innerHTML = `
            <div class="sem-resultados">
                <div class="sem-resultados-icone">🔍</div>
                <h3>Nenhum serviço encontrado</h3>
                <p>Tente buscar por outro termo ou selecione uma categoria diferente</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = servicos.map(servico => `
        <article class="servico-card" onclick="abrirTutorial(${servico.id})">
            <div class="servico-header">
                <div class="servico-icone" role="img" aria-label="${servico.nome}">${servico.icone}</div>
                <div class="servico-info">
                    <h3>${servico.nome}</h3>
                    <span class="servico-categoria">${servico.categoria}</span>
                </div>
            </div>
            <p class="servico-descricao">${servico.descricao}</p>
            <button class="btn-ver-tutorial" aria-label="Ver tutorial de ${servico.nome}">
                Ver Tutorial Passo a Passo
            </button>
        </article>
    `).join('');
}

function filtrarPorCategoria(btnClicado) {
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.remove('ativo');
    });
    btnClicado.classList.add('ativo');
    
    const categoria = btnClicado.dataset.categoria;
    
    if (categoria === 'todos') {
        servicosFiltrados = todosServicos;
    } else {
        servicosFiltrados = todosServicos.filter(s => s.categoria === categoria);
    }
    
    renderizarServicos(servicosFiltrados);
    
    document.getElementById('input-busca').value = '';
}

function realizarBusca(termo) {
    termo = termo.toLowerCase().trim();
    
    if (termo === '') {
        servicosFiltrados = todosServicos;
    } else {
        servicosFiltrados = todosServicos.filter(servico => {
            return servico.nome.toLowerCase().includes(termo) ||
                   servico.descricao.toLowerCase().includes(termo) ||
                   servico.categoria.toLowerCase().includes(termo);
        });
    }
    
    renderizarServicos(servicosFiltrados);
    
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.remove('ativo');
    });
    document.querySelector('[data-categoria="todos"]').classList.add('ativo');
}

function abrirTutorial(servicoId) {
    const servico = todosServicos.find(s => s.id === servicoId);
    console.log(servico)
    if (!servico) return;
    
    document.getElementById('modal-icone').textContent = servico.icone;
    document.getElementById('modal-nome').textContent = servico.nome;
    document.getElementById('modal-descricao').textContent = servico.descricao;

    
    let videoHtml = '';
    if (servico.video) {
        videoHtml = `
            <div class="video-container">
                <h3 style="color: var(--cor-primaria); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    📹 Vídeo Tutorial
                </h3>
                <div class="video-wrapper">
                    <iframe 
                        src="${servico.video}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        title="Vídeo tutorial de ${servico.nome}">
                    </iframe>
                </div>
            </div>
        `;
    }
    
    let dicasHtml = '';
    if (servico.dicas && servico.dicas.length > 0) {
        dicasHtml = `
            <div class="dicas-container">
                <h3 style="color: var(--cor-primaria); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    💡 Dicas Importantes
                </h3>
                <div class="dicas-list">
                    ${servico.dicas.map(dica => `
                        <div class="dica-item">${dica}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    const passosHtml = servico.passos.map(passo => `
        <div class="passo">
            <div style="display: flex; align-items: flex-start; gap: 1rem;">
                <span class="passo-numero">${passo.numero}</span>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="passo-imagem">${passo.imagem}</span>
                        <h4 class="passo-titulo">${passo.titulo}</h4>
                    </div>
                    <p class="passo-descricao">${passo.descricao}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('modal-passos').innerHTML = videoHtml + dicasHtml + '<h3 style="color: var(--cor-primaria); margin: 2rem 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">📋 Passo a Passo Detalhado</h3>' + passosHtml;
    document.getElementById('btn-acessar').href = servico.link;
    
    document.getElementById('modal-tutorial').classList.add('ativo');
    document.body.style.overflow = 'hidden';
    
    document.querySelector('.modal-content').scrollTo(0, 0);
    
    setTimeout(() => {
        document.querySelector('.btn-fechar').focus();
    }, 100);
}

function fecharModal() {
    document.getElementById('modal-tutorial').classList.remove('ativo');
    document.body.style.overflow = 'auto';
}

function mostrarErro() {
    const grid = document.getElementById('servicos-grid');
    grid.innerHTML = `
        <div class="sem-resultados">
            <div class="sem-resultados-icone">⚠️</div>
            <h3>Erro ao carregar serviços</h3>
            <p>Por favor, recarregue a página ou tente novamente mais tarde</p>
        </div>
    `;
}

function scrollParaSecao(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth' });
    }
}
