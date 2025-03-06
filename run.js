const fs = require('fs');

// Em Node 18+ o fetch é global; se estiver usando uma versão mais antiga, instale e importe o node-fetch.
 
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

const GITHUB_OWNER = "zKauaFerreira";
const GITHUB_REPO = "310";
const GITHUB_BRANCH = "node";
const FILE_PATH = "gradeHoraria.json";
const COMMIT_MESSAGE = "🔄 Atualização automática da grade horária";

async function fetchAndProcessSchedule() {
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
    const grouped = {};

    for (const dia of gradeHoraria) {
      const diaSemana = dia.diaSemana;
      if (!grouped[diaSemana]) {
        grouped[diaSemana] = {};
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
              
              // Modifica o nome da disciplina, se necessário.
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

              // Ajustes nos horários de término
              let horaFimPeriodo = aula.horaFimPeriodo;
              if (periodo === "Periodo-3") {
                horaFimPeriodo = "10:05";
              }
              if (periodo === "Periodo-6") {
                horaFimPeriodo = "12:30";
              }

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

    // Em vez de salvar localmente, comita o arquivo no repositório via GitHub API
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

  // Tenta obter o SHA do arquivo existente (caso exista)
  let sha;
  try {
    const getResponse = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, {
      headers: {
        "Authorization": `token ${GH_PAT}`,
        "Accept": "application/vnd.github+json"
      }
    });
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }
  } catch (err) {
    console.error("Não foi possível obter o SHA do arquivo (pode ser que o arquivo não exista):", err);
  }

  const body = {
    message: COMMIT_MESSAGE,
    content: encodedContent,
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    body.sha = sha;
  }

  const putResponse = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GH_PAT}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!putResponse.ok) {
    const errText = await putResponse.text();
    throw new Error(`Erro ao fazer commit: ${putResponse.status} ${putResponse.statusText} - ${errText}`);
  }
}

fetchAndProcessSchedule();
