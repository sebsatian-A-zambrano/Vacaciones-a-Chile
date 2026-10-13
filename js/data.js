/* =========================================================
   TIÃO TE ESPAÑOL — Dados do curso (8 mundos, 40 aulas)
   Estrutura: WORLDS[] → lessons[] → { id, title, tip, vocab[], phrases[] }
   ========================================================= */

const WORLDS = [
  {
    id: 1, icon: "👋", title: "Hola, Chile!",
    desc: "Saudações e apresentação", color: "#ff8a65",
    lessons: [
      {
        id: 1, title: "Saudações",
        tip: "Os chilenos jogam um “¿cachai?” no fim de quase toda frase — significa “tá ligado?”.",
        vocab: [
          { pt: "Oi", es: "Hola" },
          { pt: "Bom dia", es: "Buenos días" },
          { pt: "Boa tarde", es: "Buenas tardes" },
          { pt: "Boa noite", es: "Buenas noches" },
          { pt: "Tchau", es: "Chao" },
          { pt: "Até mais", es: "Hasta luego" }
        ],
        phrases: [
          { es: "¡Hola! ¿Cómo estás?", pt: "Oi! Como você está?" },
          { es: "Buenas tardes, ¿qué tal?", pt: "Boa tarde, tudo bem?" },
          { es: "¡Chao! ¡Que estés bien!", pt: "Tchau! Fique bem!" }
        ]
      },
      {
        id: 2, title: "Me apresento",
        tip: "No Chile quase ninguém diz “adiós” no dia a dia — o “¡chao!” resolve tudo.",
        vocab: [
          { pt: "Meu nome é", es: "Me llamo" },
          { pt: "Prazer em te conhecer", es: "Mucho gusto" },
          { pt: "Eu sou do Brasil", es: "Soy de Brasil" },
          { pt: "Brasileiro", es: "Brasileño" },
          { pt: "Turista", es: "Turista" },
          { pt: "Estou de férias", es: "Estoy de vacaciones" }
        ],
        phrases: [
          { es: "Hola, me llamo Tião.", pt: "Oi, meu nome é Tião." },
          { es: "Soy de Brasil y estoy de vacaciones.", pt: "Sou do Brasil e estou de férias." },
          { es: "Mucho gusto en conocerte.", pt: "Prazer em te conhecer." }
        ]
      },
      {
        id: 3, title: "De onde você é?",
        tip: "Chile em espanhol é “Chile” (se pronuncia CHI-le). O gentílico é “chileno”.",
        vocab: [
          { pt: "De onde você é?", es: "¿De dónde eres?" },
          { pt: "País", es: "País" },
          { pt: "Cidade", es: "Ciudad" },
          { pt: "Idioma", es: "Idioma" },
          { pt: "Português", es: "Portugués" },
          { pt: "Espanhol", es: "Español" }
        ],
        phrases: [
          { es: "¿De dónde eres tú?", pt: "De onde você é?" },
          { es: "Soy de São Paulo, Brasil.", pt: "Sou de São Paulo, Brasil." },
          { es: "Hablo portugués y un poco de español.", pt: "Falo português e um pouco de espanhol." }
        ]
      },
      {
        id: 4, title: "Números 0 a 10",
        tip: "Atenção ao 11: em espanhol é “once”, mas no Chile a galera fala “oncé”, com som aberto.",
        vocab: [
          { pt: "Zero", es: "Cero" },
          { pt: "Um", es: "Uno" },
          { pt: "Dois", es: "Dos" },
          { pt: "Três", es: "Tres" },
          { pt: "Quatro", es: "Cuatro" },
          { pt: "Cinco", es: "Cinco" },
          { pt: "Seis", es: "Seis" },
          { pt: "Sete", es: "Siete" },
          { pt: "Oito", es: "Ocho" },
          { pt: "Nove", es: "Nueve" },
          { pt: "Dez", es: "Diez" }
        ],
        phrases: [
          { es: "¿Cuántos son?", pt: "Quantos são?" },
          { es: "Son cinco días.", pt: "São cinco dias." },
          { es: "Quiero dos, por favor.", pt: "Quero dois, por favor." }
        ]
      },
      {
        id: 5, title: "Idade e dados",
        tip: "Idade em espanhol usa o verbo TER: “Tengo treinta años” — nunca “soy treinta”.",
        vocab: [
          { pt: "Quantos anos você tem?", es: "¿Cuántos años tienes?" },
          { pt: "Eu tenho 30 anos", es: "Tengo treinta años" },
          { pt: "Aniversário", es: "Cumpleaños" },
          { pt: "Data de nascimento", es: "Fecha de nacimiento" },
          { pt: "Telefone", es: "Teléfono" },
          { pt: "Endereço", es: "Dirección" }
        ],
        phrases: [
          { es: "¿Cuántos años tienes?", pt: "Quantos anos você tem?" },
          { es: "Tengo treinta años.", pt: "Tenho trinta anos." },
          { es: "Mi cumpleaños es en enero.", pt: "Meu aniversário é em janeiro." }
        ]
      }
    ]
  },

  {
    id: 2, icon: "💰", title: "Dinero y tiempo",
    desc: "Números, dinheiro, horas e dias", color: "#ffd54f",
    lessons: [
      {
        id: 6, title: "Números 11 a 20",
        tip: "Do 16 ao 19 tudo é colado: dieciséis, diecisiete, dieciocho, diecinueve.",
        vocab: [
          { pt: "Onze", es: "Once" },
          { pt: "Doze", es: "Doce" },
          { pt: "Treze", es: "Trece" },
          { pt: "Catorze", es: "Catorce" },
          { pt: "Quinze", es: "Quince" },
          { pt: "Dezesseis", es: "Dieciséis" },
          { pt: "Dezessete", es: "Diecisiete" },
          { pt: "Dezoito", es: "Dieciocho" },
          { pt: "Dezenove", es: "Diecinueve" },
          { pt: "Vinte", es: "Veinte" }
        ],
        phrases: [
          { es: "¿Cuántos años tiene tu hermano?", pt: "Quantos anos tem seu irmão?" },
          { es: "Tiene diecisiete años.", pt: "Ele tem dezessete anos." },
          { es: "Son las doce.", pt: "São doze horas." }
        ]
      },
      {
        id: 7, title: "Dezenas",
        tip: "As dezenas se juntam com “y”: 35 = treinta y cinco. Igualzinho ao português!",
        vocab: [
          { pt: "Trinta", es: "Treinta" },
          { pt: "Quarenta", es: "Cuarenta" },
          { pt: "Cinquenta", es: "Cincuenta" },
          { pt: "Sessenta", es: "Sesenta" },
          { pt: "Setenta", es: "Setenta" },
          { pt: "Oitenta", es: "Ochenta" },
          { pt: "Noventa", es: "Noventa" },
          { pt: "Cem", es: "Cien" }
        ],
        phrases: [
          { es: "Treinta y cinco mil pesos.", pt: "Trinta e cinco mil pesos." },
          { es: "¿Cuántos kilómetros son?", pt: "Quantos quilômetros são?" },
          { es: "Son cuarenta.", pt: "São quarenta." }
        ]
      },
      {
        id: 8, title: "Dinheiro",
        tip: "O troco no Chile é “el vuelto”: “¿Me da el vuelto?” (Me dá o troco?)",
        vocab: [
          { pt: "Dinheiro", es: "Dinero" },
          { pt: "Peso (moeda do Chile)", es: "Peso" },
          { pt: "Dinheiro em espécie", es: "Efectivo" },
          { pt: "Cartão", es: "Tarjeta" },
          { pt: "Troco", es: "Vuelto" },
          { pt: "Câmbio", es: "Cambio" },
          { pt: "Casa de câmbio", es: "Casa de cambio" }
        ],
        phrases: [
          { es: "¿Acepta tarjeta?", pt: "Aceita cartão?" },
          { es: "Pago en efectivo.", pt: "Pago em dinheiro." },
          { es: "¿Me da el vuelto, por favor?", pt: "Me dá o troco, por favor?" }
        ]
      },
      {
        id: 9, title: "Horas",
        tip: "A 1 hora é singular (“es la una”), o resto é plural (“son las dos”).",
        vocab: [
          { pt: "Que horas são?", es: "¿Qué hora es?" },
          { pt: "Uma hora", es: "La una" },
          { pt: "Duas horas", es: "Las dos" },
          { pt: "Meio-dia", es: "Mediodía" },
          { pt: "Meia-noite", es: "Medianoche" },
          { pt: "E meia (30 min)", es: "Y media" },
          { pt: "Em ponto", es: "En punto" }
        ],
        phrases: [
          { es: "¿Qué hora es?", pt: "Que horas são?" },
          { es: "Son las tres de la tarde.", pt: "São três da tarde." },
          { es: "La reserva es a las ocho en punto.", pt: "A reserva é às oito em ponto." }
        ]
      },
      {
        id: 10, title: "Dias e agenda",
        tip: "Os dias da semana são minúsculos em espanhol: lunes, martes… sem maiúscula!",
        vocab: [
          { pt: "Segunda-feira", es: "Lunes" },
          { pt: "Terça-feira", es: "Martes" },
          { pt: "Quarta-feira", es: "Miércoles" },
          { pt: "Quinta-feira", es: "Jueves" },
          { pt: "Sexta-feira", es: "Viernes" },
          { pt: "Sábado", es: "Sábado" },
          { pt: "Domingo", es: "Domingo" },
          { pt: "Hoje", es: "Hoy" },
          { pt: "Amanhã", es: "Mañana" }
        ],
        phrases: [
          { es: "¿Qué día es hoy?", pt: "Que dia é hoje?" },
          { es: "Hoy es lunes.", pt: "Hoje é segunda-feira." },
          { es: "Mañana salgo para el norte.", pt: "Amanhã parto para o norte." }
        ]
      }
    ]
  },

  {
    id: 3, icon: "✈️", title: "Aeropuerto y llegada",
    desc: "Voo, imigração, bagagem e chegada", color: "#4fc3f7",
    lessons: [
      {
        id: 11, title: "No aeroporto",
        tip: "Chamam a passagem aérea de “pasaje” no Chile — “boleto” é mais usado em outros países.",
        vocab: [
          { pt: "Aeroporto", es: "Aeropuerto" },
          { pt: "Voo", es: "Vuelo" },
          { pt: "Passagem aérea", es: "Pasaje" },
          { pt: "Portão de embarque", es: "Puerta" },
          { pt: "Embarque", es: "Embarque" },
          { pt: "Decolagem", es: "Despegue" }
        ],
        phrases: [
          { es: "¿De qué puerta sale el vuelo?", pt: "De qual portão sai o voo?" },
          { es: "El vuelo sale a las nueve.", pt: "O voo sai às nove." },
          { es: "¿Dónde está el embarque?", pt: "Onde fica o embarque?" }
        ]
      },
      {
        id: 12, title: "Imigração",
        tip: "Na imigração responda curto e honesto: “Soy turista, vengo de vacaciones”.",
        vocab: [
          { pt: "Passaporte", es: "Pasaporte" },
          { pt: "Oficial de imigração", es: "Oficial de migración" },
          { pt: "Turismo", es: "Turismo" },
          { pt: "Visto", es: "Visa" },
          { pt: "Assinatura", es: "Firma" },
          { pt: "Bagagem", es: "Equipaje" }
        ],
        phrases: [
          { es: "Soy turista y vengo de vacaciones.", pt: "Sou turista e vim de férias." },
          { es: "¿Cuánto tiempo va a estar en Chile?", pt: "Quanto tempo vai ficar no Chile?" },
          { es: "Una semana.", pt: "Uma semana." }
        ]
      },
      {
        id: 13, title: "No avião",
        tip: "No Chile o cobertor de avião se chama “frazada” — em outros países, “manta”.",
        vocab: [
          { pt: "Assento", es: "Asiento" },
          { pt: "Janela", es: "Ventana" },
          { pt: "Corredor", es: "Pasillo" },
          { pt: "Cinto de segurança", es: "Cinturón de seguridad" },
          { pt: "Cobertor", es: "Frazada" },
          { pt: "Comissária de bordo", es: "Azafata" }
        ],
        phrases: [
          { es: "¿Puedo tomar agua, por favor?", pt: "Posso tomar água, por favor?" },
          { es: "¿Está ocupado este asiento?", pt: "Está ocupado este assento?" },
          { es: "¿Me da una frazada?", pt: "Me dá um cobertor?" }
        ]
      },
      {
        id: 14, title: "Bagagem",
        tip: "Perdeu a mala? Vá ao balcão de “equipaje perdido” com a etiqueta da mala na mão.",
        vocab: [
          { pt: "Mala", es: "Maleta" },
          { pt: "Mala de mão", es: "Maleta de mano" },
          { pt: "Esteira de bagagem", es: "Cinta" },
          { pt: "Perdida", es: "Perdida" },
          { pt: "Reclamar", es: "Reclamar" },
          { pt: "Etiqueta", es: "Etiqueta" }
        ],
        phrases: [
          { es: "Mi maleta no llegó.", pt: "Minha mala não chegou." },
          { es: "¿Dónde reclamo el equipaje?", pt: "Onde eu reclamo a bagagem?" },
          { es: "Aquí está mi etiqueta.", pt: "Aqui está a minha etiqueta." }
        ]
      },
      {
        id: 15, title: "Chegando ao Chile",
        tip: "“Al tiro” = já já / imediatamente. O táxi chega “al tiro” no Chile!",
        vocab: [
          { pt: "Chegada", es: "Llegada" },
          { pt: "Saída", es: "Salida" },
          { pt: "Táxi", es: "Taxi" },
          { pt: "Aluguel de carro", es: "Arriendo de auto" },
          { pt: "Centro da cidade", es: "Centro" },
          { pt: "Correio", es: "Correo" }
        ],
        phrases: [
          { es: "¿Dónde está la salida?", pt: "Onde fica a saída?" },
          { es: "Quiero un taxi al centro, por favor.", pt: "Quero um táxi ao centro, por favor." },
          { es: "¿Cuánto cuesta el arriendo de auto?", pt: "Quanto custa o aluguel de carro?" }
        ]
      }
    ]
  },

  {
    id: 4, icon: "🏨", title: "El hotel",
    desc: "Reserva, quarto, pedidos e problemas", color: "#ba68c8",
    lessons: [
      {
        id: 16, title: "Fazendo a reserva",
        tip: "Reserva de hotel no Chile: “hacer una reserva”. Peça a tarifa com café da manhã incluído.",
        vocab: [
          { pt: "Reserva", es: "Reserva" },
          { pt: "Quarto", es: "Habitación" },
          { pt: "Cama de casal", es: "Cama matrimonial" },
          { pt: "Diária / tarifa", es: "Tarifa" },
          { pt: "Confirmar", es: "Confirmar" },
          { pt: "Hóspede", es: "Huésped" }
        ],
        phrases: [
          { es: "Quiero reservar una habitación.", pt: "Quero reservar um quarto." },
          { es: "¿Incluye el desayuno?", pt: "O café da manhã está incluído?" },
          { es: "¿Puedo confirmar mi reserva?", pt: "Posso confirmar minha reserva?" }
        ]
      },
      {
        id: 17, title: "Check-in",
        tip: "O chileno fala “lleno/a” quando algo está CHEIO: hotel lleno = hotel lotado.",
        vocab: [
          { pt: "Recepção", es: "Recepción" },
          { pt: "Chave / cartão", es: "Llave" },
          { pt: "Documento", es: "Documento" },
          { pt: "Preencher", es: "Llenar" },
          { pt: "Formulário", es: "Formulario" },
          { pt: "Andar", es: "Piso" }
        ],
        phrases: [
          { es: "Tengo una reserva a nombre de Tião.", pt: "Tenho uma reserva em nome de Tião." },
          { es: "¿En qué piso está la habitación?", pt: "Em que andar fica o quarto?" },
          { es: "¿Puedo llenar el formulario aquí?", pt: "Posso preencher o formulário aqui?" }
        ]
      },
      {
        id: 18, title: "No quarto",
        tip: "Não confunda: “llave” é chave, “lleno” é cheio. Escritas parecidas, sentidos diferentes!",
        vocab: [
          { pt: "Banheiro", es: "Baño" },
          { pt: "Toalha", es: "Toalla" },
          { pt: "Sabonete", es: "Jabón" },
          { pt: "Água quente", es: "Agua caliente" },
          { pt: "Ar-condicionado", es: "Aire acondicionado" },
          { pt: "Travesseiro", es: "Almohada" }
        ],
        phrases: [
          { es: "No hay agua caliente.", pt: "Não tem água quente." },
          { es: "¿Me trae más toallas, por favor?", pt: "Me traz mais toalhas, por favor?" },
          { es: "El aire acondicionado no funciona.", pt: "O ar-condicionado não funciona." }
        ]
      },
      {
        id: 19, title: "Pedidos no hotel",
        tip: "Pedi a senha do wifi? É “la clave” ou “la contraseña”.",
        vocab: [
          { pt: "Café da manhã", es: "Desayuno" },
          { pt: "Serviço de quarto", es: "Servicio a la habitación" },
          { pt: "Limpar", es: "Limpiar" },
          { pt: "Senha (wifi)", es: "Contraseña" },
          { pt: "Cama", es: "Cama" },
          { pt: "Amenities / itens", es: "Artículos de aseo" }
        ],
        phrases: [
          { es: "¿A qué hora es el desayuno?", pt: "A que horas é o café da manhã?" },
          { es: "¿Cuál es la contraseña del wifi?", pt: "Qual é a senha do wifi?" },
          { es: "¿Pueden limpiar la habitación?", pt: "Podem limpar o quarto?" }
        ]
      },
      {
        id: 20, title: "Problemas no hotel",
        tip: "Reclamar educadamente rende mais: comece com “Disculpe, pero…” (Desculpe, mas…).",
        vocab: [
          { pt: "Barulho", es: "Ruido" },
          { pt: "Consertar", es: "Arreglar" },
          { pt: "Trocar", es: "Cambiar" },
          { pt: "Reembolso", es: "Reembolso" },
          { pt: "Gerente", es: "Gerente" },
          { pt: "Reclamar / queixar-se", es: "Quejarse" }
        ],
        phrases: [
          { es: "Hay mucho ruido en mi habitación.", pt: "Tem muito barulho no meu quarto." },
          { es: "¿Pueden cambiarme de habitación?", pt: "Podem me trocar de quarto?" },
          { es: "Quiero hablar con el gerente.", pt: "Quero falar com o gerente." }
        ]
      }
    ]
  },

  {
    id: 5, icon: "🍽️", title: "La comida",
    desc: "Restaurante, bebidas e comida típica", color: "#81c784",
    lessons: [
      {
        id: 21, title: "No restaurante",
        tip: "No Chile o garçom é “el garzón”. Peça a carta: “¿Me trae la carta, por favor?”.",
        vocab: [
          { pt: "Mesa", es: "Mesa" },
          { pt: "Cardápio", es: "Carta" },
          { pt: "Garçom", es: "Garzón" },
          { pt: "A conta", es: "La cuenta" },
          { pt: "Prato", es: "Plato" },
          { pt: "Entrada", es: "Entrada" }
        ],
        phrases: [
          { es: "Una mesa para dos, por favor.", pt: "Uma mesa para dois, por favor." },
          { es: "¿Me trae la carta?", pt: "Me traz o cardápio?" },
          { es: "¿Qué recomienda?", pt: "O que o senhor recomenda?" }
        ]
      },
      {
        id: 22, title: "Pedindo comida",
        tip: "“Quisiera” é o jeito educado de pedir — vale ouro em qualquer restaurante.",
        vocab: [
          { pt: "Eu gostaria (de pedir)", es: "Quisiera" },
          { pt: "Com", es: "Con" },
          { pt: "Sem", es: "Sin" },
          { pt: "Bem passado", es: "Bien cocido" },
          { pt: "Ao ponto", es: "Término medio" },
          { pt: "Outro / outra", es: "Otro" }
        ],
        phrases: [
          { es: "Quisiera el pollo, por favor.", pt: "Eu queria o frango, por favor." },
          { es: "Sin cebolla, por favor.", pt: "Sem cebola, por favor." },
          { es: "¿Me trae otro vaso de agua?", pt: "Me traz outro copo de água?" }
        ]
      },
      {
        id: 23, title: "Bebidas",
        tip: "Água sem gás = “agua sin gas”, com gás = “agua con gas”. O garzón entende assim mesmo.",
        vocab: [
          { pt: "Água sem gás", es: "Agua sin gas" },
          { pt: "Água com gás", es: "Agua con gas" },
          { pt: "Suco", es: "Jugo" },
          { pt: "Cerveja", es: "Cerveza" },
          { pt: "Vinho", es: "Vino" },
          { pt: "Chá", es: "Té" }
        ],
        phrases: [
          { es: "¿Tiene jugo natural?", pt: "Tem suco natural?" },
          { es: "Una cerveza bien fría.", pt: "Uma cerveja bem gelada." },
          { es: "¿Me trae un té, por favor?", pt: "Me traz um chá, por favor?" }
        ]
      },
      {
        id: 24, title: "Comida típica chilena",
        tip: "“Pastel de choclo” é torta de milho salgada — prato nacional junto com a empanada.",
        vocab: [
          { pt: "Empanada", es: "Empanada" },
          { pt: "Cachorro-quente chileno", es: "Completo" },
          { pt: "Torta de milho", es: "Pastel de choclo" },
          { pt: "Ensopado chileno", es: "Cazuela" },
          { pt: "Frutos do mar", es: "Mariscos" },
          { pt: "Drink nacional", es: "Pisco sour" }
        ],
        phrases: [
          { es: "Quiero probar una empanada.", pt: "Quero provar uma empanada." },
          { es: "¿Tiene pastel de choclo hoy?", pt: "Tem pastel de choclo hoje?" },
          { es: "El pisco sour es muy famoso.", pt: "O pisco sour é muito famoso." }
        ]
      },
      {
        id: 25, title: "A conta e a gorjeta",
        tip: "A conta no Chile é “la boleta” ou “la cuenta”. Gorjeta de 10% costuma vir incluída.",
        vocab: [
          { pt: "A conta, por favor", es: "La cuenta, por favor" },
          { pt: "Dinheiro em espécie", es: "Efectivo" },
          { pt: "Cartão", es: "Tarjeta" },
          { pt: "Gorjeta", es: "Propina" },
          { pt: "Dividir a conta", es: "Dividir" },
          { pt: "Recibo / nota", es: "Boleta" }
        ],
        phrases: [
          { es: "¿Me trae la cuenta, por favor?", pt: "Me traz a conta, por favor?" },
          { es: "¿Puedo pagar con tarjeta?", pt: "Posso pagar com cartão?" },
          { es: "¿Incluye la propina?", pt: "A gorjeta está incluída?" }
        ]
      }
    ]
  },

  {
    id: 6, icon: "🚇", title: "La ciudad",
    desc: "Transporte, direções e lugares", color: "#64b5f6",
    lessons: [
      {
        id: 26, title: "Táxi e aplicativos",
        tip: "No Chile a corrida de táxi é “la carrera”. Peça a corrida por aplicativo para economizar.",
        vocab: [
          { pt: "Táxi", es: "Taxi" },
          { pt: "Aplicativo", es: "Aplicación" },
          { pt: "Motorista", es: "Conductor" },
          { pt: "Corrida", es: "Carrera" },
          { pt: "Eu estou aqui", es: "Estoy aquí" },
          { pt: "Endereço", es: "Dirección" }
        ],
        phrases: [
          { es: "¿Cuánto cuesta la carrera al centro?", pt: "Quanto custa a corrida até o centro?" },
          { es: "Estoy aquí, en la puerta azul.", pt: "Estou aqui, na porta azul." },
          { es: "¿Puede llevarme a esta dirección?", pt: "Pode me levar a este endereço?" }
        ]
      },
      {
        id: 27, title: "Micro e metrô",
        tip: "Em Santiago o ônibus se chama “micro” e o bilhete é a “tarjeta Bip!”. Dá pra recarregar em qualquer estação.",
        vocab: [
          { pt: "Ônibus", es: "Micro" },
          { pt: "Metrô", es: "Metro" },
          { pt: "Passagem", es: "Pasaje" },
          { pt: "Parada de ônibus", es: "Parada" },
          { pt: "Cartão de transporte", es: "Tarjeta Bip!" },
          { pt: "Integração", es: "Combinación" }
        ],
        phrases: [
          { es: "¿Esta micro va al centro?", pt: "Este ônibus vai ao centro?" },
          { es: "¿Dónde compro la tarjeta Bip!?", pt: "Onde compro o cartão Bip!?" },
          { es: "¿Qué combinación tomo para el metro?", pt: "Qual integração pego para o metrô?" }
        ]
      },
      {
        id: 28, title: "Direções",
        tip: "Cuidado com “derecho”: reto/em frente = “derecho”; direita = “derecha”.",
        vocab: [
          { pt: "Esquerda", es: "Izquierda" },
          { pt: "Direita", es: "Derecha" },
          { pt: "Reto / em frente", es: "Derecho" },
          { pt: "Quarteirão", es: "Cuadra" },
          { pt: "Perto", es: "Cerca" },
          { pt: "Longe", es: "Lejos" }
        ],
        phrases: [
          { es: "¿Está cerca o está lejos?", pt: "É perto ou é longe?" },
          { es: "Siga derecho dos cuadras.", pt: "Siga reto duas quadras." },
          { es: "Gire a la izquierda en la esquina.", pt: "Vire à esquerda na esquina." }
        ]
      },
      {
        id: 29, title: "Lugares da cidade",
        tip: "Banheiro público em sinalização chilena costuma vir como “servicios” ou “WC”.",
        vocab: [
          { pt: "Praça", es: "Plaza" },
          { pt: "Praia", es: "Playa" },
          { pt: "Mercado", es: "Mercado" },
          { pt: "Banco", es: "Banco" },
          { pt: "Hospital", es: "Hospital" },
          { pt: "Banheiro público", es: "Servicios" }
        ],
        phrases: [
          { es: "¿Dónde está la playa más cerca?", pt: "Onde fica a praia mais próxima?" },
          { es: "¿Hay un banco por aquí?", pt: "Tem um banco por aqui?" },
          { es: "¿Dónde están los servicios?", pt: "Onde fica o banheiro?" }
        ]
      },
      {
        id: 30, title: "Alugando um carro",
        tip: "Posto de gasolina no Chile é “la bomba” — “bomba de bencina”. Bencina = gasolina.",
        vocab: [
          { pt: "Posto de gasolina", es: "Bomba de bencina" },
          { pt: "Estrada", es: "Carretera" },
          { pt: "Pedágio", es: "Peaje" },
          { pt: "Estacionamento", es: "Estacionamiento" },
          { pt: "Semáforo", es: "Semáforo" },
          { pt: "Dirigir", es: "Manejar" }
        ],
        phrases: [
          { es: "¿Dónde puedo estacionar?", pt: "Onde posso estacionar?" },
          { es: "¿Aceptan tarjeta en el peaje?", pt: "Aceitam cartão no pedágio?" },
          { es: "Quiero llenar el estanque.", pt: "Quero encher o tanque." }
        ]
      }
    ]
  },

  {
    id: 7, icon: "🛍️", title: "Las compras",
    desc: "Lojas, roupas, preços e regateio", color: "#f06292",
    lessons: [
      {
        id: 31, title: "Nas lojas",
        tip: "Feira de rua em espanhol chileno é “la feria” — lá as frutas são mais baratas!",
        vocab: [
          { pt: "Loja", es: "Tienda" },
          { pt: "Shopping", es: "Mall" },
          { pt: "Feira (de rua)", es: "Feria" },
          { pt: "Aberto", es: "Abierto" },
          { pt: "Fechado", es: "Cerrado" },
          { pt: "Funcionário", es: "Dependiente" }
        ],
        phrases: [
          { es: "¿A qué hora abre la tienda?", pt: "A que horas a loja abre?" },
          { es: "¿Está abierto hoy?", pt: "Está aberto hoje?" },
          { es: "Disculpe, ¿puede ayudarme?", pt: "Com licença, pode me ajudar?" }
        ]
      },
      {
        id: 32, title: "Roupas e tamanhos",
        tip: "Camiseta no Chile é “polera”! E tênis é “zapatillas”. Anota essas duas.",
        vocab: [
          { pt: "Camiseta", es: "Polera" },
          { pt: "Calça", es: "Pantalón" },
          { pt: "Jaqueta", es: "Chaqueta" },
          { pt: "Tênis", es: "Zapatillas" },
          { pt: "Meia", es: "Calcetín" },
          { pt: "Tamanho", es: "Talla" }
        ],
        phrases: [
          { es: "¿Tiene esta polera en talla M?", pt: "Tem essa camiseta no tamanho M?" },
          { es: "¿Puedo probarme esto?", pt: "Posso experimentar isso?" },
          { es: "No me queda bien.", pt: "Não ficou bom em mim." }
        ]
      },
      {
        id: 33, title: "Preços",
        tip: "Antes de trocar dinheiro, pergunte a taxa: “¿A qué tipo de cambio está?”.",
        vocab: [
          { pt: "Quanto custa?", es: "¿Cuánto cuesta?" },
          { pt: "Caro", es: "Caro" },
          { pt: "Barato", es: "Barato" },
          { pt: "Desconto", es: "Descuento" },
          { pt: "Preço", es: "Precio" },
          { pt: "De graça", es: "Gratis" }
        ],
        phrases: [
          { es: "¿Cuánto cuesta esto?", pt: "Quanto custa isso?" },
          { es: "Es muy caro para mí.", pt: "É muito caro para mim." },
          { es: "¿Tiene descuento?", pt: "Tem desconto?" }
        ]
      },
      {
        id: 34, title: "Regateio",
        tip: "Regatear funciona em feiras e artesanato — nunca em loja de shopping.",
        vocab: [
          { pt: "Muito caro", es: "Muy caro" },
          { pt: "Aceita cartão?", es: "¿Acepta tarjeta?" },
          { pt: "Pode fazer mais barato?", es: "¿Me lo deja más barato?" },
          { pt: "Só estou olhando", es: "Solo estoy mirando" },
          { pt: "Eu levo", es: "Me lo llevo" },
          { pt: "Oferta / proposta", es: "Oferta" }
        ],
        phrases: [
          { es: "¿Me lo deja más barato?", pt: "Pode me fazer mais barato?" },
          { es: "Solo estoy mirando, gracias.", pt: "Só estou olhando, obrigado." },
          { es: "Si me lo deja en cinco mil, me lo llevo.", pt: "Se deixar por cinco mil, eu levo." }
        ]
      },
      {
        id: 35, title: "Lembranças",
        tip: "O moai de Rapa Nui (Ilha de Páscoa) é a lembrança mais chilena que existe.",
        vocab: [
          { pt: "Lembrança", es: "Recuerdo" },
          { pt: "Artesanato", es: "Artesanía" },
          { pt: "Lã", es: "Lana" },
          { pt: "Estátua da Ilha de Páscoa", es: "Moai" },
          { pt: "Vinho chileno", es: "Vino" },
          { pt: "Presente", es: "Regalo" }
        ],
        phrases: [
          { es: "Busco un recuerdo típico.", pt: "Procuro uma lembrança típica." },
          { es: "¿Tiene artesanía en lana?", pt: "Tem artesanato em lã?" },
          { es: "Quiero llevar vino de regalo.", pt: "Quero levar vinho de presente." }
        ]
      }
    ]
  },

  {
    id: 8, icon: "🆘", title: "Sobrevivencia",
    desc: "Emergências, saúde e despedida", color: "#e57373",
    lessons: [
      {
        id: 36, title: "Emergências",
        tip: "Emergência no Chile: ligue 133 (polícia), 131 (ambulância) ou 132 (bombeiros).",
        vocab: [
          { pt: "Socorro!", es: "¡Auxilio!" },
          { pt: "Polícia", es: "Policía" },
          { pt: "Ambulância", es: "Ambulancia" },
          { pt: "Bombeiros", es: "Bomberos" },
          { pt: "Roubaram meu celular", es: "Me robaron el celular" },
          { pt: "Eu perdi (algo)", es: "Perdí" }
        ],
        phrases: [
          { es: "¡Auxilio! Necesito ayuda.", pt: "Socorro! Preciso de ajuda." },
          { es: "Me robaron el celular.", pt: "Roubaram meu celular." },
          { es: "¿Dónde está la comisaría más cercana?", pt: "Onde fica a delegacia mais próxima?" }
        ]
      },
      {
        id: 37, title: "Farmácia e saúde",
        tip: "Resfriado no Chile é “resfrío”. Na farmácia peça o “medicamento” pelo nome genérico.",
        vocab: [
          { pt: "Farmácia", es: "Farmacia" },
          { pt: "Remédio", es: "Medicamento" },
          { pt: "Dor de cabeça", es: "Dolor de cabeza" },
          { pt: "Febre", es: "Fiebre" },
          { pt: "Resfriado", es: "Resfrío" },
          { pt: "Receita médica", es: "Receta" }
        ],
        phrases: [
          { es: "Tengo dolor de cabeza y fiebre.", pt: "Estou com dor de cabeça e febre." },
          { es: "¿Tiene algo para el resfrío?", pt: "Tem algo para o resfriado?" },
          { es: "¿Necesito receta para esto?", pt: "Preciso de receita para isso?" }
        ]
      },
      {
        id: 38, title: "Clima e roupa",
        tip: "O clima muda muito entre o deserto do norte e a Patagônia — “¿Cómo está el clima?”.",
        vocab: [
          { pt: "Sol", es: "Sol" },
          { pt: "Chuva", es: "Lluvia" },
          { pt: "Frio", es: "Frío" },
          { pt: "Calor", es: "Calor" },
          { pt: "Casaco", es: "Abrigo" },
          { pt: "Previsão do tempo", es: "Pronóstico" }
        ],
        phrases: [
          { es: "¿Cómo está el clima hoy?", pt: "Como está o clima hoje?" },
          { es: "Va a llover mañana.", pt: "Vai chover amanhã." },
          { es: "Necesito un abrigo.", pt: "Preciso de um casaco." }
        ]
      },
      {
        id: 39, title: "Modismos chilenos",
        tip: "“Bacán” = muito legal. “Fome” = chato/sem graça. Com essas duas você já fala chileno!",
        vocab: [
          { pt: "Tá ligado?", es: "¿Cachai?" },
          { pt: "Po (ênfase)", es: "Po" },
          { pt: "Já já / agora mesmo", es: "Al tiro" },
          { pt: "Muito legal", es: "Bacán" },
          { pt: "Sem graça / chato", es: "Fome" },
          { pt: "Namorado(a)", es: "Pololo / polola" }
        ],
        phrases: [
          { es: "¿Cachai, po?", pt: "Tá ligado, né?" },
          { es: "¡Qué bacán tu viaje!", pt: "Que legal sua viagem!" },
          { es: "Voy al tiro.", pt: "Vou já já." }
        ]
      },
      {
        id: 40, title: "Despedida",
        tip: "Fechou a viagem com chave de ouro: “¡Muchas gracias por todo! ¡Nos vemos, Chile!”.",
        vocab: [
          { pt: "Obrigado", es: "Gracias" },
          { pt: "De nada", es: "De nada" },
          { pt: "Desculpe / com licença", es: "Perdón" },
          { pt: "Você me ajudou muito", es: "Me ayudó mucho" },
          { pt: "Volte logo", es: "Vuelva pronto" },
          { pt: "Até depois", es: "Nos vemos" }
        ],
        phrases: [
          { es: "Muchas gracias por todo.", pt: "Muito obrigado por tudo." },
          { es: "Me ayudó mucho, de verdad.", pt: "Você me ajudou muito, sério." },
          { es: "¡Nos vemos, Chile! ¡Fue bacán!", pt: "Até mais, Chile! Foi demais!" }
        ]
      }
    ]
  }
];
