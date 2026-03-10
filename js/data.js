// ===== DADOS DO PLANO =====
var PLAN = {
  name: 'Google One AI Premium',
  shortName: 'Ultra',
  storage: '2 TB',
  priceTotal: 779.40,
  pricePerPerson: 129.90,
  maxMembers: 6
};

// GROUPS agora vem 100% da API (admin panel)
var GROUPS = [];

var FAQS = [
  {
    question: 'Como funciona o rateio do Google Ultra?',
    answer: 'O Google One AI Premium permite adicionar ate 5 membros ao Grupo Familiar. O investimento e de R$129,90 por pessoa, incluindo R$ 29,90 referentes a taxa de administracao e seguranca, garantindo a organizacao dos grupos familiares sem quedas de conta.'
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
    answer: 'Se um membro sair, a vaga e reaberta automaticamente para que outra pessoa possa entrar. E para isso que serve nossa taxa de administracao: garantir que o grupo esteja sempre ativo e confiavel.'
  },
  {
    question: 'O pagamento e mensal?',
    answer: 'Sim, o valor de R$129,90 e a sua assinatura mensal do plano Google One AI Premium com a taxa de administracao inclusa. Voce recebera o link de pagamento todo mes para manter sua vaga no grupo seguro.'
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
