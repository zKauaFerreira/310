document.addEventListener('DOMContentLoaded', function() {
  const dayMap = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado"
  };

  let gradeData = [];
  let currentTime = null;
  let currentDay = null;
  let activeDay = null;

  const dayNav = document.getElementById('day-nav');
  
  fetch('gradeHoraria.json')
    .then(response => response.json())
    .then(data => {
      gradeData = data;
      initApp();
    })
    .catch(error => {
      console.error("Erro ao carregar os dados:", error);
    });

  function initApp() {
    dayNav.innerHTML = '';
    gradeData.forEach(item => {
      const btn = document.createElement('button');
      btn.textContent = item.diaSemana.slice(0, 3).toUpperCase();
      btn.dataset.dia = item.diaSemana;
      btn.addEventListener('click', () => {
        if (btn.dataset.dia === activeDay) return;
        const buttons = Array.from(dayNav.querySelectorAll('button'));
        const currentBtn = buttons.find(b => b.classList.contains('active'));
        animateActiveTransition(currentBtn, btn, buttons);
        displaySchedule(item.diaSemana);
      });
      dayNav.appendChild(btn);
    });

    const today = new Date();
    let todayName = dayMap[today.getDay()];

    if (today.getDay() === 6 || today.getDay() === 0 || (today.getHours() * 60 + today.getMinutes()) > 770) {
      todayName = getNextWeekday(today.getDay());
    }

    currentDay = todayName;

    const todayItem = gradeData.find(item => item.diaSemana === todayName) || gradeData[0];
    dayNav.querySelectorAll('button').forEach(btn => {
      if (btn.dataset.dia === todayItem.diaSemana) {
        btn.classList.add('active');
      }
    });

    currentTime = today;
    activeDay = todayItem.diaSemana;
    displaySchedule(todayItem.diaSemana, today);
  }

  function getNextWeekday(currentDayNum) {
    if (currentDayNum === 6 || currentDayNum === 0) {
      return "Segunda-feira";
    } else if (currentDayNum === 5 && (new Date().getHours() * 60 + new Date().getMinutes()) > 770) {
      return "Segunda-feira";
    } else {
      const nextDay = (currentDayNum + 1) % 7;
      return dayMap[nextDay];
    }
  }

  function animateActiveTransition(currentBtn, targetBtn, buttons) {
    if (!currentBtn) {
      targetBtn.classList.add('active');
      activeDay = targetBtn.dataset.dia;
      return;
    }
    const currentIndex = buttons.indexOf(currentBtn);
    const targetIndex = buttons.indexOf(targetBtn);
    const direction = targetIndex > currentIndex ? 1 : -1;
    const steps = Math.abs(targetIndex - currentIndex);
    const delay = 75;
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        buttons[currentIndex + (i - 1) * direction].classList.remove('active');
        buttons[currentIndex + i * direction].classList.add('active');
        if (i === steps) {
          activeDay = targetBtn.dataset.dia;
        }
      }, delay * i);
    }
  }

  function displaySchedule(diaSemana, time) {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';

    const daySchedule = gradeData.find(item => item.diaSemana === diaSemana);
    if (!daySchedule) {
      container.innerHTML = `<p>Nenhuma informação para ${diaSemana}</p>`;
      return;
    }

    currentTime = time || currentTime;
    activeDay = diaSemana;

    daySchedule.periodos.forEach((periodo, index) => {
      const periodoElement = document.createElement('div');
      periodoElement.classList.add('cardDisciplinaContainer');
      periodoElement.innerHTML = `
        <div>${periodo.horaInicioPeriodo}</div>
        <div>${periodo.disciplina}</div>
      `;

      if (diaSemana === currentDay && isCurrentPeriod(periodo, currentTime)) {
        periodoElement.style.backgroundColor = 'rgba(189, 147, 249, 0.2)';
        periodoElement.style.border = '2px solid #BD93F9';
        periodoElement.style.boxShadow = '0 0 15px rgba(189, 147, 249, 0.4)';
      }

      periodoElement.addEventListener('click', () => {
        openModal(periodo);
      });

      container.appendChild(periodoElement);

      if (index === 2) {
        const recessDivider = document.createElement('div');
        recessDivider.className = 'recess-divider';
        recessDivider.innerHTML = '<i class="fa fa-clock-o" style="color: #ffffff;"></i> INTERVALO <i class="fa fa-clock-o" style="color: #ffffff;"></i>';
        container.appendChild(recessDivider);
      }
    });
  }

  function isCurrentPeriod(periodo, currentTime) {
    if (!currentTime) return false;
    const startTime = convertToMinutes(periodo.horaInicioPeriodo);
    const endTime = convertToMinutes(periodo.horaFimPeriodo);
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return currentMinutes >= startTime && currentMinutes < endTime;
  }

  function convertToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Modal
  const modal = document.getElementById('modal');
  const modalContent = document.querySelector('.modal-content');

  function openModal(periodo) {
    modalContent.innerHTML = `
    <span id="modal-close" class="close">&times;</span>
    <h2>${periodo.disciplina}</h2>
    <div>
      <span class="info-icon"><i class="fa fa-users"></i></span>
      <span class="modal-label">Turma:</span> 310
    </div>
    <div>
      <span class="info-icon"><i class="fa fa-building"></i></span>
      <span class="modal-label">Sala:</span> 13
    </div>
    <div>
      <span class="info-icon"><i class="fa fa-user"></i></span>
      <span class="modal-label">Prof:</span> ${periodo.professor}
    </div>
    <div>
      <span class="info-icon"><i class="fa fa-clock-o"></i></span>
      <span class="modal-label">Início:</span> ${periodo.horaInicioPeriodo}
    </div>
    <div>
      <span class="info-icon"><i class="fa fa-clock-o"></i></span>
      <span class="modal-label">Fim:</span> ${periodo.horaFimPeriodo}
    </div>
  `;
  
  
  
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    const newModalClose = document.getElementById('modal-close');
    newModalClose.addEventListener('click', closeModal);
  }
  

  function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  function handleModalClose(event) {
    if (event.target === modal) {
      closeModal();
    }
  }

  window.addEventListener('click', handleModalClose);

  document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
  });

  // Nova função de compartilhamento com texto formatado
  const shareBtn = document.getElementById('share-btn');

  shareBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await shareSelectedDay();
  });

  async function shareSelectedDay() {
    const daySchedule = gradeData.find(item => item.diaSemana === activeDay);
    if (!daySchedule) return;
  
    // Definindo os caracteres de formatação com base no WhatsApp
    let bold = '*';
    let italic = '_';
    let strikethrough = '~';
    let quote = '> ';
    let codeBlock = '```';
  
    let shareText = `${codeBlock}📚 Grade Horária da Turma 310 📚${codeBlock}\n\n`;
    shareText += `🗓️ ${bold}Dia:${bold} ${activeDay}.\n\n`;
  
    daySchedule.periodos.forEach((periodo, index) => {
      const primeiroNome = periodo.professor.split(' ')[0];
  
      shareText += `⏰ ${bold}${periodo.horaInicioPeriodo}${bold} - ${bold}${periodo.horaFimPeriodo}${bold}\n`;
      shareText += `📖 ${bold}${periodo.disciplina}.${bold}\n`;
      shareText += `🏫 ${bold}Professor(a):${bold} ${primeiroNome}.\n\n`;
  
      if (index === 2) shareText += `☕ ${italic}Intervalo${italic} ☕\n\n`;
    });
  
    shareText += `🔗 ${bold}Para consultar outros dias, acesse:${bold}\n`;
    shareText += `➡️ https://zkauaferreira.github.io/310\n\n`;
    shareText += `✨ ${italic}Tenha um ótimo dia de estudos!${italic} 🎓`;
  
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Grade Horária - ${activeDay}`,
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('📋 Texto copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  }
});  