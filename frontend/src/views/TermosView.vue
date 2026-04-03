<template>
  <div class="termos-page">
    <div class="termos-card card">
      <div class="termos-header">
        <router-link to="/" class="btn-voltar">← Voltar</router-link>
        <div class="logo">😂 <span>FunnyApp</span></div>
      </div>

      <h1>Termos de Uso</h1>
      <p class="data-atualizacao">Última atualização: {{ dataAtual }}</p>

      <div class="secao">
        <h2>1. Aceitação dos Termos</h2>
        <p>Ao criar uma conta ou usar o FunnyApp, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.</p>
      </div>

      <div class="secao">
        <h2>2. O que é o FunnyApp</h2>
        <p>O FunnyApp é uma plataforma de compartilhamento de imagens e memes onde usuários podem publicar, curtir, comentar e interagir com conteúdo humorístico.</p>
      </div>

      <div class="secao">
        <h2>3. Cadastro e Conta</h2>
        <p>Para usar o FunnyApp você deve:</p>
        <ul>
          <li>Ter pelo menos 13 anos de idade</li>
          <li>Fornecer informações verdadeiras no cadastro</li>
          <li>Manter sua senha segura e não compartilhá-la</li>
          <li>Ser responsável por toda atividade na sua conta</li>
        </ul>
      </div>

      <div class="secao">
        <h2>4. Conteúdo Proibido</h2>
        <p>É estritamente proibido publicar conteúdo que:</p>
        <ul>
          <li>Contenha nudez ou conteúdo sexual explícito</li>
          <li>Promova violência, ódio ou discriminação</li>
          <li>Assédio ou bullying contra outros usuários</li>
          <li>Viole direitos autorais de terceiros</li>
          <li>Seja spam ou conteúdo enganoso</li>
          <li>Envolva menores de idade de forma inapropriada</li>
          <li>Seja ilegal em qualquer forma</li>
        </ul>
      </div>

      <div class="secao">
        <h2>5. Conteúdo do Usuário</h2>
        <p>Você é o responsável pelo conteúdo que publica. Ao publicar, você declara ter os direitos necessários sobre o conteúdo. O FunnyApp pode remover qualquer conteúdo que viole estes termos sem aviso prévio.</p>
      </div>

      <div class="secao">
        <h2>6. Moderação e Banimento</h2>
        <p>Nossa equipe de moderação pode remover conteúdos e banir usuários que violem estes termos. Decisões de moderação são definitivas.</p>
      </div>

      <div class="secao">
        <h2>7. Denúncias</h2>
        <p>Utilize o botão 🚩 para denunciar conteúdo inapropriado. Denúncias falsas ou de má-fé podem resultar em banimento.</p>
      </div>

      <div class="secao">
        <h2>8. Disponibilidade do Serviço</h2>
        <p>O FunnyApp pode ficar indisponível para manutenção sem aviso prévio. Não garantimos disponibilidade ininterrupta.</p>
      </div>

      <div class="secao">
        <h2>9. Alterações nos Termos</h2>
        <p>Podemos atualizar estes termos a qualquer momento. O uso contínuo do serviço após alterações indica sua aceitação dos novos termos.</p>
      </div>

      <div class="secao">
        <h2>10. Contato</h2>
        <p>Para dúvidas sobre estes termos, entre em contato pelo email: <a href="mailto:funnyapp.noreply@gmail.com">funnyapp.noreply@gmail.com</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
</script>

<style scoped>
.termos-page { max-width: 720px; margin: 0 auto; padding: 32px 16px; }
.termos-card { padding: 40px; }
.termos-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.btn-voltar { color: var(--cinza-400); text-decoration: none; font-size: 0.88rem; transition: color var(--transition); }
.btn-voltar:hover { color: var(--branco); }
.logo { font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.logo span { font-family: var(--fonte-titulo); color: var(--amarelo); }
h1 { font-family: var(--fonte-titulo); font-size: 1.8rem; margin-bottom: 6px; }
.data-atualizacao { font-size: 0.82rem; color: var(--cinza-400); margin-bottom: 32px; }
.secao { margin-bottom: 28px; }
.secao h2 { font-size: 1rem; font-weight: 600; margin-bottom: 10px; color: var(--amarelo); }
.secao p { color: var(--cinza-200); font-size: 0.9rem; line-height: 1.7; }
.secao ul { padding-left: 20px; margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
.secao ul li { color: var(--cinza-200); font-size: 0.9rem; line-height: 1.6; }
.secao a { color: var(--amarelo); }
</style>
