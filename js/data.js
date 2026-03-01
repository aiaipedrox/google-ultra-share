// ===== DADOS DO PLANO =====
var PLAN = {
  name: 'Google One AI Premium',
  shortName: 'Ultra',
  storage: '2 TB',
  priceTotal: 609.00,
  pricePerPerson: 101.50,
  maxMembers: 6
};

// GROUPS agora vem 100% da API (admin panel)
var GROUPS = [];

var FAQS = [
  {
    question: 'Como funciona o rateio do Google Ultra?',
    answer: 'O Google One AI Premium permite adicionar ate 5 membros ao Grupo Familiar. Assim, 6 pessoas dividem o custo total de R$609/mes, ficando apenas R$101,50 por pessoa. Cada membro mantem seus arquivos 100% privados.'
  },
  {
    question: 'Meus arquivos ficam visiveis para outros membros?',
    answer: 'Nao! O armazenamento e compartilhado em capacidade (2TB total), mas cada pessoa tem seus proprios arquivos completamente privados. Ninguem do grupo tem acesso ao que e seu.'
  },
  {
    question: 'Como recebo o acesso apos o pagamento?',
    answer: 'Apos confirmar o pagamento, voce sera redirecionado para o WhatsApp onde enviara seu e-mail Google. O administrador do grupo enviara um convite para o Grupo Familiar do Google diretamente para o seu e-mail.'
  },
  {
    question: 'Quais formas de pagamento sao aceitas?',
    answer: 'Aceitamos Pix (processamento instantaneo), cartao de credito e boleto bancario. Todos os pagamentos sao processados de forma segura pela plataforma Dias Marketplace.'
  },
  {
    question: 'E se alguem sair do grupo?',
    answer: 'Se um membro sair, a vaga e reaberta automaticamente para que outra pessoa possa entrar. O administrador gerencia as vagas e garante que o grupo esteja sempre ativo.'
  },
  {
    question: 'O pagamento e mensal?',
    answer: 'Sim, o valor de R$101,50 e a sua parte mensal do plano Google One AI Premium. Voce recebera o link de pagamento todo mes para manter sua vaga no grupo.'
  },
  {
    question: 'E seguro?',
    answer: 'Totalmente! Os pagamentos sao processados pela Dias Marketplace, uma plataforma certificada. Nao armazenamos nenhum dado financeiro. Seu e-mail e compartilhado apenas com o administrador do grupo via WhatsApp criptografado.'
  }
];

// CONFIGURE SEU NUMERO DO WHATSAPP AQUI
// Formato: 55 + DDD + numero (ex: 5511999999999)
var WHATSAPP_NUMBER = '5500000000000';
var WHATSAPP_MESSAGE = function (groupId) {
  return 'Ola! Acabei de pagar minha vaga no grupo ' + groupId + ' do Google Ultra. Meu e-mail Google e: ';
};
