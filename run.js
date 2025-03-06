const axios = require('axios');

const API_AUTHORIZATION = process.env.API_AUTHORIZATION;
const GH_PAT = process.env.GH_PAT; // GitHub Personal Access Token

if (!API_AUTHORIZATION) {
  console.error("❌ ERRO: A variável de ambiente 'API_AUTHORIZATION' não está definida.");
  process.exit(1);
}

if (!GH_PAT) {
  console.error("❌ ERRO: A variável de ambiente 'GH_PAT' não está definida.");
  process.exit(1);
}

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

const GITHUB_OWNER = "zkauaferreira"; // exatamente como na URL desejada
const GITHUB_REPO = "310";
const GITHUB_BRANCH = "main";
const FILE_PATH = "gradeHoraria.json";

async function fetchAndProcessSchedule() {
  try {
    const response = await axios.get(API_URL, { headers: HEADERS });
    const data = response.data;

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

    // Agrupa as informações por dia da semana e por período.
    const grouped = {};
    for (const dia of gradeHoraria) {
      const diaSemana = dia.diaSemana;
      if (!grouped[diaSemana]) grouped[diaSemana] = {};
      if (dia.turnos && Array.isArray(dia.turnos)) {
        for (const turno of dia.turnos) {
          if (turno.aulas && Array.isArray(turno.aulas)) {
            for (const aula of turno.aulas) {
              let periodoRaw = aula.periodo || "";
              let periodo = "";
              if (periodoRaw) {
                const num = parseInt(periodoRaw);
                periodo = isNaN(num) ? periodoRaw : `Periodo-${num}`;
              } else {
                periodo = "Sem-Periodo";
              }
              let disciplina = aula.disciplina;
              if (disciplina === "Língua Estrangeira - Língua Inglesa") disciplina = "Inglês";
              if (disciplina === "Resolução de Problemas") disciplina = "Res. de Problemas";
              if (disciplina === "Língua Portuguesa") disciplina = "Português";
              if (disciplina === "Arte") disciplina = "Artes";
              let horaFimPeriodo = aula.horaFimPeriodo;
              if (periodo === "Periodo-3") horaFimPeriodo = "10:05";
              if (periodo === "Periodo-6") horaFimPeriodo = "12:30";
              if (!grouped[diaSemana][periodo]) {
                grouped[diaSemana][periodo] = {
                  disciplina: disciplina,
                  horaInicioPeriodo: aula.horaInicioPeriodo,
                  horaFimPeriodo: horaFimPeriodo,
                  professor: (aula.professores && aula.professores.length > 0) ? aula.professores[0].nome : ""
                };
              }
            }
          }
        }
      }
    }

    // Converte a estrutura agrupada para um array
    const result = [];
    for (const dia in grouped) {
      const periodosArray = [];
      for (const periodo in grouped[dia]) {
        periodosArray.push({ periodo, ...grouped[dia][periodo] });
      }
      result.push({ diaSemana: dia, periodos: periodosArray });
    }

    const contentString = JSON.stringify(result, null, 2);
    await commitFileToRepo(contentString);
    console.log("✅ Grade horária atualizada e commit realizado no repositório");
  } catch (error) {
    console.error("❌ Erro ao fazer fetch ou atualizar os dados:", error);
  }
}

async function commitFileToRepo(content) {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
  const encodedContent = Buffer.from(content).toString('base64');

  // Obtém o SHA do arquivo se existir
  let sha = null;
  const shaResponse = await axios.get(apiUrl, {
    headers: {
      Authorization: `token ${GH_PAT}`,
      Accept: 'application/vnd.github.v3+json'
    }
  }).catch(() => null);
  if (shaResponse && shaResponse.data) {
    sha = shaResponse.data.sha;
  }

  // Formata a data e hora atual separadamente (fuso: America/Sao_Paulo)
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const now = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const commitMessage = `🔄 Atualização automática! Em ${today}, ${now}.`;

  const body = {
    message: commitMessage,
    content: encodedContent,
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha;

  try {
    await axios.put(apiUrl, body, {
      headers: {
        Authorization: `token ${GH_PAT}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
  } catch (err) {
    const errText = err.response ? JSON.stringify(err.response.data) : err.message;
    throw new Error(`Erro ao fazer commit: ${err.response.status} ${err.response.statusText} - ${errText}`);
  }
}

fetchAndProcessSchedule();
