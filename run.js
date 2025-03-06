const fs = require('fs');
// Para Node < 18, descomente a linha abaixo e instale o node-fetch:
// const fetch = require('node-fetch');
const API_AUTHORIZATION = process.env.API_AUTHORIZATION;
const API_URL = "https://secweb.procergs.com.br/ise-escolars-estudante/rest/estudante/cidadao/05099946011/alunos-dashboard?versaoEndpoint=v2";

const HEADERS = {
  "accept": "application/json, text/plain, */*",
  "authorization": API_AUTHORIZATION,
  "content-type": "application/json",
  "sec-ch-ua": "\"Opera GX\";v=\"116\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "Referer": "https://estudante.escola.rs.gov.br/",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

async function fetchAndSaveSchedule() {
  try {
    const response = await fetch(API_URL, { method: "GET", headers: HEADERS });
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.alunos || !Array.isArray(data.alunos)) {
      throw new Error("A propriedade 'alunos' não foi encontrada na resposta.");
    }

    // Procura pela gradeHoraria no primeiro aluno que a possuir
    let gradeHoraria;
    for (const aluno of data.alunos) {
      if (aluno.gradeHoraria) {
        gradeHoraria = aluno.gradeHoraria;
        break;
      }
    }
    if (!gradeHoraria) {
      throw new Error("A propriedade 'gradeHoraria' não foi encontrada em nenhum aluno.");
    }

    // Agrupa as informações por dia da semana e, dentro dele, por período.
    // Para cada aula, extrai:
    //   - Período (convertido para o formato "Periodo-X")
    //   - Disciplina, hora de início, hora de fim e o primeiro professor
    const grouped = {}; // Estrutura: { "Segunda-feira": { "Periodo-1": {…}, "Periodo-2": {…} }, ... }

    for (const dia of gradeHoraria) {
      const diaSemana = dia.diaSemana;
      if (!grouped[diaSemana]) {
        grouped[diaSemana] = {}; // Inicializa o agrupamento para o dia
      }
      if (dia.turnos && Array.isArray(dia.turnos)) {
        for (const turno of dia.turnos) {
          if (turno.aulas && Array.isArray(turno.aulas)) {
            for (const aula of turno.aulas) {
              let periodoRaw = aula.periodo || "";
              let periodo;
              if (periodoRaw) {
                const num = parseInt(periodoRaw);
                periodo = isNaN(num) ? periodoRaw : `Periodo-${num}`;
              } else {
                periodo = "Sem-Periodo";
              }
              
              // Aplica as modificações solicitadas para a disciplina
              let disciplina = aula.disciplina;
              if (disciplina === "Língua Estrangeira - Língua Inglesa") {
                disciplina = "Inglês";
              }
              if (disciplina === "Resolução de Problemas") {
                disciplina = "Res. de Problemas";
              }
              if (disciplina === "Língua Portuguesa") {
                disciplina = "Português";
              }
              if (disciplina === "Arte") {
                disciplina = "Artes";
              }

              // MODIFICAÇÕES AQUI: Ajustes nos horários de término
              let horaFimPeriodo = aula.horaFimPeriodo;
              if (periodo === "Periodo-3") {
                horaFimPeriodo = "10:05";
              }
              if (periodo === "Periodo-6") {
                horaFimPeriodo = "12:30"; // Nova modificação para o período 6
              }

              // Se houver mais de uma aula para o mesmo período, você pode optar por agrupar em um array.
              // Aqui, assumimos que cada período possui apenas uma entrada.
              if (!grouped[diaSemana][periodo]) {
                grouped[diaSemana][periodo] = {
                  disciplina: disciplina,
                  horaInicioPeriodo: aula.horaInicioPeriodo,
                  horaFimPeriodo: horaFimPeriodo, // Usa a variável modificada
                  professor: (aula.professores && aula.professores.length > 0) ? aula.professores[0].nome : ""
                };
              }
            }
          }
        }
      }
    }

    // Converte a estrutura agrupada para um array, onde cada dia da semana é o objeto principal
    // e seus períodos são armazenados em um array interno.
    const result = [];
    for (const dia in grouped) {
      const periodosArray = [];
      for (const periodo in grouped[dia]) {
        periodosArray.push({
          periodo,
          ...grouped[dia][periodo]
        });
      }
      result.push({
        diaSemana: dia,
        periodos: periodosArray
      });
    }

    fs.writeFileSync('gradeHoraria.json', JSON.stringify(result, null, 2));
    console.log("✅ Grade horária agrupada salva em 'gradeHoraria.json'");
    
  } catch (error) {
    console.error("❌ Erro ao fazer fetch ou salvar os dados:", error);
  }
}

fetchAndSaveSchedule();