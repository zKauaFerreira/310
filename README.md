# ✨ Grade Horária 310 ✨
## 📚 Documentação Técnica

![Header](https://via.placeholder.com/1920x300/2E3440/BD93F9?text=✨+MONITORAMENTO+DE+AULAS+EM+TEMPO+REAL+✨)

---

## 🚀 Funcionalidades Incríveis

- **🕒 Detecção Automática do Dia Atual**  
- **📊 Barra de Progresso em Tempo Real**  
- **🔄 Auto-Recarregamento nos Horários de Troca de Aula**  
- **📱 Design 100% Responsivo**  
- **🎞 Transições Animadas**  
- **📤 Compartilhamento Otimizado para WhatsApp**

---

## 🏗 Arquitetura do Sistema

```mermaid
graph TD
    A[Endpoint não oficial 🚫] -->|JSON| B(Node.js)
    B -->|Processamento| C[Transformação & Agrupamento]
    C --> D{gradeHoraria.json}
    D -->|GitHub Actions 🤖| E[Deploy Automático]
    E --> F[Frontend Dinâmico]
    F -->|Interação| G[Usuário Final 😊]
```

> **⚠️ ATENÇÃO:**  
> Esta aplicação utiliza um **endpoint não oficial** para obter os dados da grade horária.  
> O serviço **pode parar de funcionar a qualquer momento** se houver alterações no endpoint!

---

## ⚡ Tecnologias Utilizadas

| Tecnologia             | Ícone |
|------------------------|:-----:|
| **JavaScript ES6+**    | ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=000) |
| **HTML5**              | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=fff) |
| **CSS3**               | ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=fff) |
| **Node.js**            | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=fff) |
| **GitHub API**         | ![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=github&logoColor=fff) |
| **GitHub Actions**     | ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=github&logoColor=fff) |
| **Endpoint API**       | ![API](https://img.shields.io/badge/-API-000000?logo=api&logoColor=fff) |

---

## 🔄 Fluxo de Dados em Tempo Real

```mermaid
sequenceDiagram
    Endpoint não oficial ->>+ Servidor: Requisição diária (06:00)
    Servidor ->>+ Processamento: Filtra dados da Turma 310
    Processamento ->>+ GitHub: Commit automático via API
    GitHub ->>+ Frontend: Redeploy no GitHub Pages
    Frontend ->>+ Usuário: Exibe dados atualizados 🎉
```

---

## 🎨 Interface do Usuário

- **🌙 Dark Mode Automático**  
- **💡 Efeitos Neon e Blur Dinâmico**  
- **📐 Layout 100% Responsivo**  
- **📤 Compartilhamento via WhatsApp**

<div align="center">
  <img src="https://via.placeholder.com/800x450/2E3440/BD93F9?text=Interface+Moderna" alt="UI Preview" style="border-radius: 15px; box-shadow: 0 0 15px rgba(0,0,0,0.3);">
</div>

---

## 🚨 Aviso Importante

> **⚠️ ATENÇÃO:**  
> Esta aplicação utiliza um **endpoint não oficial** para obter a grade horária.  
> **O endpoint pode ser descontinuado ou alterado sem aviso prévio**, impactando o funcionamento do sistema!  
> Mantenha-se atento às atualizações e verifique regularmente o status do serviço.

---

## 📜 Licença

<div align="center">
  <img src="https://img.shields.io/badge/Licença-MIT-purple?style=for-the-badge&logo=open-source-initiative" alt="MIT License">
  <p>Uso livre, modificação e distribuição. Perfeito para estudos e integrações com APIs.</p>
</div>

---

## 👨‍💻 Créditos

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/zKauaFerreira">
          <img src="https://avatars.githubusercontent.com/u/13006795?v=4" width="100" style="border-radius: 50%;"><br>
          <strong>Kauã Ferreira</strong>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/he4rt">
          <img src="https://avatars.githubusercontent.com/u/10360088?v=4" width="100" style="border-radius: 50%;"><br>
          <strong>@he4rt</strong>
        </a>
      </td>
      <td align="center">
        <img src="https://via.placeholder.com/100?text=310" width="100" style="border-radius: 50%;"><br>
        <strong>Turma 310</strong>
      </td>
    </tr>
  </table>
</div>

---

## 🔗 Links Úteis

- **Acesse o Projeto:** [https://zkauaferreira.github.io/310](https://zkauaferreira.github.io/310)  
- **Estatísticas:**  
  <img src="https://komarev.com/ghpvc/?username=zKauaFerreira-310&color=blueviolet&style=flat-square" alt="Visitas">
  <img src="https://img.shields.io/badge/Última_Atualização-🟢_Online-green?style=flat-square" alt="Última Atualização">
